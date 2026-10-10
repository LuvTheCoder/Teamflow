const supabase = require("../config/supabase")

async function findUserByEmail(email){
    const {data, error} = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

    if(error){
        throw error;
    }

    return data;
}

async function findUserById(id){
    const {data, error} = await supabase.from("users")
    .select("id, name, email, created_at")
    .eq("id", id)
    .maybeSingle();

    if(error) throw error;
    return data;
}

async function createUser(name, email, passwordHash){
    const {data, error} = await supabase.from("users")
    .insert({name, email, password_hash: passwordHash})
    .select("id, name, email")
    .single();

    if(error) throw error;
    return data;
}

module.exports = {findUserByEmail, findUserById, createUser};