import { renderToStaticMarkup } from "react-dom/server";
import { getCitationFilePath } from "../../api";
import { Fact } from "../../api";

type HtmlParsedAnswer = {
    answersHtml: string;
    citations: string[];
    scores: number[];
};

export function parseAnswerToHtml(answer: Fact[]): HtmlParsedAnswer {
    const answersHtml: string = ""
    const citations: string[] = [];
    const scores: number[] = []

console.log(answer)

    let result = answer.reduce((acc, fact) => {
        acc + "," + fact.content
    }, "")

    return {
        answerHtml: result,
        citations,
        scores
    };
}
