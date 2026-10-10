const AppError = require("../utils/AppError");


// Checks data against a Zod schema. Returns clean data or throws a 400 error
function validate(schema, data){
    const result = schema.safeParse(data);

    if(!result.success){
        const message = result.error.issues
            .map(e => e.message)
            .join(", ");
        throw new AppError(message, 400);
    }

    return result.data;
}

module.exports = validate;