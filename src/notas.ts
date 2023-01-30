class Estudiante {
  nick: string;
  notaProyecto: number;
  notaExtra: number;
  notaPresentacion: number;
  notaFinal: number;
  constructor(
    nick: string,
    notaProyecto: number,
    notaExtra: number,
    notaPresentacion: number,
    notaFinal: number
  ) {
    this.nick = nick;
    this.notaProyecto = notaProyecto;
    this.notaExtra = notaExtra;
    this.notaPresentacion = notaPresentacion;
    this.notaFinal = notaFinal;
  }
}
import { readCSV } from "https://deno.land/x/csv/mod.ts";

export class Notas {
  notas: Estudiante[] = [];
  fileName: string;
  constructor(csvFileName: string) {
    this.fileName = csvFileName;
  }

  async setup() {
    const notas = await Deno.open(this.fileName);
    for await (const row of readCSV(notas)) {
      const cells = [];
      for await (const cell of row) cells.push(cell);
      if (cells.length === 0) continue;
      const estudiante = new Estudiante(
        cells[0] as string,
        cells[1] as unknown as number,
        cells[2] as unknown as number,
        cells[3] as unknown as number,
        cells[4] as unknown as number
      );
      this.notas.push(estudiante);
    }
    notas.close();
  }
}