import {
  assertEquals,
  assert,
  assertNotEquals,
} from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { Notas } from "./src/notas.ts";

Deno.test(async function readTest() {
  const notas = new Notas("data/notas-iv-22-23-ordinaria.csv");
  await notas.setup();
  assertEquals(notas.notas.size, 5);
  for (const [nick, estudiante] of notas.notas) {
    assertNotEquals(nick, "");
    assertEquals(typeof nick, "string");
    assert(estudiante.notaFinal >= estudiante.notaProyecto);
  }
  assertEquals(notas.notas.get("quux")?.notaPresentacion, 0);
  assertEquals(notas.notas.get("quux")?.notaProyecto, 2.45);
});
