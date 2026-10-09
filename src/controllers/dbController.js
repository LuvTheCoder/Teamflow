const { supabase } = require("../config/supabase");

// Temporary: checks that Supabase is reachable
async function checkDatabase(req, res) {
  // Race the Supabase query against an 8-second timeout
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Supabase query timed out after 8s")), 8000)
  );

  try {
    const query = supabase.from("users").select("id").limit(1);

    const { error } = await Promise.race([query, timeout]);

    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Database query failed",
        details: error.message,
        hint: error.hint || null,
        code: error.code || null,
      });
    }

    res.status(200).json({
      status: "ok",
      message: "Database connected successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
      hint: "Check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
    });
  }
}

module.exports = { checkDatabase };