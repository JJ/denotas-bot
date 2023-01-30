import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { Notas } from "./src/notas.ts";

Deno.test(async function readTest() {
  const notas = new Notas("data/notas-iv-22-23-ordinaria.csv");
  await notas.setup();
  assertEquals(notas.notas.length, 4);
});
