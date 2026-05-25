import type { FetchedPage } from "../../http/fetch-page";
import type { LLMOCheck } from "../audit";

export function checkCitability(page: FetchedPage): LLMOCheck {
  const text = page.$("main,article,body").text().replace(/\s+/g, " ").trim();
  const sentences = text
    .split(/[。.!?？]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const definitionLike = sentences.filter((sentence) =>
    /(とは|means|is a|refers to|defined as|because|理由)/i.test(sentence),
  );
  const evidenceLike = sentences.filter((sentence) =>
    /\d|%|年|月|調査|survey|data|according to/i.test(sentence),
  );
  const score = Math.min(
    100,
    definitionLike.length * 15 + evidenceLike.length * 10,
  );

  return {
    id: "llmo.citability",
    label: "Citation-ready factual density",
    score,
    weight: 2,
    detail: `${definitionLike.length} definition-like and ${evidenceLike.length} evidence-like sentence(s)`,
  };
}
