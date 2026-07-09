import { describe, expect, it, mock } from "bun:test";
import type { Request, Response } from "express";
import { healthHandler } from "./index";

describe("health handler", () => {
	it("responds with status ok and a numeric uptime", () => {
		const json = mock((_body: unknown) => {});
		const res = { json } as unknown as Response;

		healthHandler({} as Request, res);

		expect(json).toHaveBeenCalledTimes(1);

		const body = json.mock.calls[0]![0] as { status: string; uptime: number };
		expect(body.status).toBe("ok");
		expect(typeof body.uptime).toBe("number");
	});
});
