from collections import namedtuple
from typing import List

import torch
from qdrant_client.http.models import ScoredPoint
from sentence_transformers import CrossEncoder
from spacy.tokens import Doc
from .embedding import embed_text, return_context
from .models import Section, User, Room

# rerank_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
rerank_model = CrossEncoder("cross-encoder/msmarco-MiniLM-L12-en-de-v1")

RerankResult = namedtuple(
    "RerankResult",
    ["section", "doc", "embedded", "before", "after", "score", "search_result"]
)

def re_rank_results(
        search_results: List[ScoredPoint],
        question: str,
        user: User,
        room: Room,
        max_results: int = 3
) -> List[tuple[Section, str, Doc, str, str, float, ScoredPoint]]:
    """
      Returns the top 3 reranked results with full context.
      Each item is a tuple of:
      (section, doc, embedded_text, before, after, score, search_result)
      """
    section_ids = [res.payload.get("section_id") for res in search_results]
    sections_map = Section.objects.in_bulk(section_ids)

    prepared = []
    for res in search_results:
        section = sections_map.get(res.payload.get("section_id"))
        if not section:
            continue

        embedded_text = embed_text(section.document.text, user.lang)
        before, after = return_context(
            embedded_text,
            section.doc_index,
            room.settings.get("pre_phrase_count"),
            room.settings.get("post_phrase_count"),
        )

        doc = f"{before} {section.content} {after}"

        prepared.append((section, doc, embedded_text, before, after, 0.0, res))

    # Predict rerank scores
    pairs = [(question, doc) for _, doc, *_ in prepared]
    scores = rerank_model.predict(pairs)
    probs = torch.sigmoid(torch.tensor(scores)).numpy()

    # Attach scores
    prepared = [
        (section, doc, embedded, before, after, float(prob), res)
        for (section, doc, embedded, before, after, _, res), prob in zip(prepared, probs)
    ]

    # Sort and take top 3
    sorted_results = sorted(prepared, key=lambda x: x[5], reverse=True)[:max_results]

    return sorted_results
