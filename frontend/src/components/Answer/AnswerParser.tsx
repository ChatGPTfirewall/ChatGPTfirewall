import { renderToStaticMarkup } from "react-dom/server";
import { getCitationFilePath } from "../../api";
import { Fact } from "../../api";

type HtmlParsedAnswer = {
    answersHtml: string;
    citations: string[];
    scores: number[];
};

export function parseAnswerToHtml(answer: Fact[]): HtmlParsedAnswer {
    let answersHtml: string = ""
    const citations: string[] = [];
    const scores: number[] = []

    for (var fact of answer) {
        answersHtml = answersHtml + "," + fact.content
      }
    
    console.log(answersHtml)

    return {
        answersHtml: answersHtml,
        citations,
        scores
    };
}
