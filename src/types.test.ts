import { describe, it, expect } from "vitest";
import {
  FEATURE_REF_REGEX,
  EPIC_REF_REGEX,
  INITIATIVE_REF_REGEX,
  GOAL_REF_REGEX,
  REQUIREMENT_REF_REGEX,
  NOTE_REF_REGEX,
  IDEA_REF_REGEX,
} from "./types.js";

describe("FEATURE_REF_REGEX", () => {
  it("matches plain features", () => {
    expect(FEATURE_REF_REGEX.test("PROJ-123")).toBe(true);
    expect(FEATURE_REF_REGEX.test("ZS-28")).toBe(true);
    expect(FEATURE_REF_REGEX.test("DEVELOP-1")).toBe(true);
  });
  it("does not match epics, initiatives, goals, requirements, notes, ideas", () => {
    expect(FEATURE_REF_REGEX.test("ZS-E-28")).toBe(false);
    expect(FEATURE_REF_REGEX.test("ZS-S-1")).toBe(false);
    expect(FEATURE_REF_REGEX.test("ZS-G-1")).toBe(false);
    expect(FEATURE_REF_REGEX.test("PROJ-123-1")).toBe(false);
    expect(FEATURE_REF_REGEX.test("PROJ-N-1")).toBe(false);
    expect(FEATURE_REF_REGEX.test("PROJ-I-1")).toBe(false);
  });
});

describe("EPIC_REF_REGEX", () => {
  it("matches epic references", () => {
    expect(EPIC_REF_REGEX.test("ZS-E-28")).toBe(true);
    expect(EPIC_REF_REGEX.test("PROJ-E-1")).toBe(true);
  });
  it("does not match features or other types", () => {
    expect(EPIC_REF_REGEX.test("ZS-28")).toBe(false);
    expect(EPIC_REF_REGEX.test("ZS-S-1")).toBe(false);
    expect(EPIC_REF_REGEX.test("ZS-G-1")).toBe(false);
  });
});

describe("INITIATIVE_REF_REGEX", () => {
  it("matches initiative references", () => {
    expect(INITIATIVE_REF_REGEX.test("PROJ-S-5")).toBe(true);
    expect(INITIATIVE_REF_REGEX.test("ZS-S-100")).toBe(true);
  });
  it("does not match other types", () => {
    expect(INITIATIVE_REF_REGEX.test("PROJ-123")).toBe(false);
    expect(INITIATIVE_REF_REGEX.test("PROJ-E-5")).toBe(false);
    expect(INITIATIVE_REF_REGEX.test("PROJ-G-5")).toBe(false);
  });
});

describe("GOAL_REF_REGEX", () => {
  it("matches goal references", () => {
    expect(GOAL_REF_REGEX.test("PROJ-G-3")).toBe(true);
    expect(GOAL_REF_REGEX.test("ZS-G-42")).toBe(true);
  });
  it("does not match other types", () => {
    expect(GOAL_REF_REGEX.test("PROJ-123")).toBe(false);
    expect(GOAL_REF_REGEX.test("PROJ-E-3")).toBe(false);
    expect(GOAL_REF_REGEX.test("PROJ-S-3")).toBe(false);
  });
});

describe("REQUIREMENT_REF_REGEX", () => {
  it("matches requirement references", () => {
    expect(REQUIREMENT_REF_REGEX.test("PROJ-123-1")).toBe(true);
    expect(REQUIREMENT_REF_REGEX.test("ADT-123-1")).toBe(true);
  });
  it("does not match features", () => {
    expect(REQUIREMENT_REF_REGEX.test("PROJ-123")).toBe(false);
  });
});

describe("NOTE_REF_REGEX", () => {
  it("matches note references", () => {
    expect(NOTE_REF_REGEX.test("ABC-N-213")).toBe(true);
    expect(NOTE_REF_REGEX.test("PROJ-N-1")).toBe(true);
  });
  it("does not match other types", () => {
    expect(NOTE_REF_REGEX.test("ABC-213")).toBe(false);
    expect(NOTE_REF_REGEX.test("ABC-I-213")).toBe(false);
  });
});

describe("IDEA_REF_REGEX", () => {
  it("matches idea references", () => {
    expect(IDEA_REF_REGEX.test("ABC-I-213")).toBe(true);
    expect(IDEA_REF_REGEX.test("PROJ-I-1")).toBe(true);
  });
  it("does not match other types", () => {
    expect(IDEA_REF_REGEX.test("ABC-213")).toBe(false);
    expect(IDEA_REF_REGEX.test("ABC-N-213")).toBe(false);
  });
});
