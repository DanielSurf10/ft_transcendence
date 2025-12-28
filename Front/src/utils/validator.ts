import { success, z } from "zod"

export function validate<T>(schema: z.ZodSchema<T>, data: unknown) {
	const result = schema.safeParse(data);

	if (result.success) {
		return { success: true, data: result.data };
	}

	const errors = result.error.issues.map((err) => err.message);
	return { success: false, errors };
}
