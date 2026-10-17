// Supabase project used to save notes (birthday page) and read them (admin.html).
// The anon key is public by design; row level security in supabase/setup.sql
// lets anyone add a note but only a signed-in admin read them.
window.NOTES = {
  url: "https://szyqohmqucktwodomfsc.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eXFvaG1xdWNrdHdvZG9tZnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNTQyNTMsImV4cCI6MjEwNzgzMDI1M30.WpLCbyf4QvP9est49LMMq6X8NqNC2hGgtZ9WbH02QeA",
};
