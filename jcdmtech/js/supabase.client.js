  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
  const cfg = window.__SUPABASE__;
  window.supabase = createClient(cfg.url, cfg.anon);

