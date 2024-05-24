import { ZodTypeAny, z } from "zod";

export const getPagedResult = <T extends ZodTypeAny>(resultSchema: T) =>
  z.object({
    count: z.number().int(),
    next: z.string().url().nullable(),
    previous: z.string().url().nullable(),
    results: resultSchema.array(),
  });

const setPartsPartSchema = z
  .object({
    part_num: z.string(),
    name: z.string(),
    part_cat_id: z.number(),
    part_url: z.string().url(),
    part_img_url: z.string().url(),
    print_of: z.string().nullable(),
  })
  .transform((x) => ({
    partNumber: x.part_num,
  }));

const setPartsColorSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    rgb: z.string(),
    is_trans: z.boolean(),
  })
  .transform(
    (x) => x.id
    // ({
    //   id: x.id,
    //   name: x.id,
    //   rgbHex: x.rgb,
    //   isTransparent: x.is_trans,
    // })
  );

export const setPartsSchema = z
  .object({
    id: z.number(),
    inv_part_id: z.number(),
    part: setPartsPartSchema,
    color: setPartsColorSchema,
    set_num: z.string(),
    quantity: z.number(),
    is_spare: z.boolean(),
    element_id: z.string().nullable(),
    num_sets: z.number(),
  })
  .transform((x) => ({
    id: x.id,
    partNumber: x.part.partNumber,
    color: x.color,
    quantity: x.quantity,
    isSpare: x.is_spare,
  }));
export type SetPartsSchema = z.output<typeof setPartsSchema>;

export const partSchema = z
  .object({
    part_num: z.string(),
    name: z.string(),
    part_cat_id: z.number(),
    year_from: z.number().optional(),
    year_to: z.number().optional(),
    part_url: z.string().url(),
    part_img_url: z.string().url().nullable(),
    prints: z.unknown().array().optional(),
    molds: z.unknown().array().optional(),
    alternates: z.unknown().array().optional(),
    external_ids: z.object({
      BrickLink: z.string().array().optional(),
      BrickOwl: z.string().array().optional(),
      Brickset: z.string().array().optional(),
      LDraw: z.string().array().optional(),
      LEGO: z.string().array().optional(),
    }),
    print_of: z.string().nullable(),
  })
  .transform((x) => ({
    partNumber: x.part_num,
    name: x.name,
    url: x.part_url,
    imageUrl: x.part_img_url,
    partCategory: x.part_cat_id,
  }));

export type Part = z.output<typeof partSchema>;

// GET /api/v3/lego/parts/{part_num}/colors/
export const partColorsSchema = z
  .object({
    color_id: z.number(),
    color_name: z.string(),
    num_sets: z.number(),
    num_set_parts: z.number(),
    part_img_url: z.string().url().nullable(),
    elements: z.string().array(),
    // part_number: z.string(),
  })
  .transform((x) => ({
    colorId: x.color_id,
    colorName: x.color_name,
    // partNumber: x.part_number,
    partImageUrl: x.part_img_url,
    setCount: x.num_sets,
  }));

export type PartColors = z.output<typeof partColorsSchema>;

export const partColorSchema = z
  .object({
    part_img_url: z.string().url().nullable(),
    year_from: z.number().int(),
    year_to: z.number().int(),
    num_sets: z.number().int(),
    num_set_parts: z.number().int(),
    elements: z.string().array(),
  })
  .transform((x) => ({
    imageUrl: x.part_img_url,
    setCount: x.num_sets,
  }));

export const partColorSetSchema = z
  .object({
    set_num: z.string(),
    name: z.string(),
    year: z.number(),
    theme_id: z.number(),
    num_parts: z.number(),
    set_img_url: z.string().nullable(),
    set_url: z.string(),
    last_modified_dt: z.string(),
  })
  .transform((x) => ({
    setNumber: x.set_num,
    name: x.name,
    year: x.year,
    imageUrl: x.set_img_url,
    url: x.set_url,
    partCount: x.num_parts,
  }));

export type PartColorSet = z.output<typeof partColorSetSchema>;
