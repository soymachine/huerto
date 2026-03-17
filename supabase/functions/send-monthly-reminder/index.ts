// Supabase Edge Function — send-monthly-reminder
// Triggered by GitHub Actions on the 1st of each month.
// Reads the `reminders` table, builds a plant task summary for the current
// month, and sends an email via Resend.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY    = Deno.env.get('RESEND_API_KEY')!;
const APP_URL           = Deno.env.get('APP_URL') ?? 'https://soymachine.github.io/huerto';

// Plant task calendar: months (1-12) when each task is relevant
// Extend this map as more plants are added
const PLANT_TASKS: Record<string, { sow?: number[]; transplant?: number[]; harvest?: number[] }> = {
  tomato:    { sow: [2,3], transplant: [4,5], harvest: [7,8,9] },
  pepper:    { sow: [2,3], transplant: [4,5], harvest: [7,8,9] },
  eggplant:  { sow: [2,3], transplant: [4,5], harvest: [7,8,9] },
  potato:    { sow: [3,4], harvest: [7,8] },
  zucchini:  { sow: [4,5], harvest: [6,7,8] },
  cucumber:  { sow: [4,5], harvest: [6,7,8] },
  pumpkin:   { sow: [4,5], harvest: [9,10] },
  watermelon:{ sow: [4,5], harvest: [7,8] },
  melon:     { sow: [4,5], harvest: [7,8] },
  lettuce:   { sow: [2,3,9,10], transplant: [3,4,10], harvest: [4,5,11,12] },
  spinach:   { sow: [2,3,9,10], harvest: [4,5,11] },
  chard:     { sow: [3,4,9], transplant: [4,5,10], harvest: [5,6,10,11,12] },
  cabbage:   { sow: [2,3,8], transplant: [3,4,9], harvest: [5,6,11,12] },
  broccoli:  { sow: [2,3,8], transplant: [3,4,9], harvest: [5,6,11] },
  cauliflower:{ sow: [2,3,8], transplant: [3,4,9], harvest: [5,6,11] },
  carrot:    { sow: [2,3,9,10], harvest: [5,6,12] },
  onion:     { sow: [2,3], transplant: [4], harvest: [7,8] },
  garlic:    { sow: [10,11], harvest: [6,7] },
  pea:       { sow: [2,3,10], harvest: [4,5,12] },
  bean:      { sow: [4,5], harvest: [7,8] },
  parsley:   { sow: [3,4,9], harvest: [5,6,10,11] },
  celery:    { sow: [2,3], transplant: [4,5], harvest: [7,8,9] },
  fennel:    { sow: [3,4], harvest: [6,7,8] },
  radish:    { sow: [3,4,9,10], harvest: [4,5,10,11] },
  strawberry:{ transplant: [3,9], harvest: [5,6] },
};

const MONTH_NAMES_ES = ['enero','febrero','marzo','abril','mayo','junio',
                        'julio','agosto','septiembre','octubre','noviembre','diciembre'];

Deno.serve(async () => {
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
  });

  const now   = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year  = now.getFullYear();
  const monthName = MONTH_NAMES_ES[month - 1];
  const season = month >= 4 && month <= 9 ? 'summer' : 'winter';

  // Fetch all enabled reminders
  const { data: reminders } = await sb
    .from('reminders')
    .select('user_id, email')
    .eq('enabled', true);

  if (!reminders || reminders.length === 0) {
    return new Response('No reminders to send', { status: 200 });
  }

  let sent = 0;
  for (const reminder of reminders as { user_id: string; email: string }[]) {
    // Get this user's gardens
    const { data: gardens } = await sb
      .from('gardens')
      .select('id, name')
      .eq('user_id', reminder.user_id);
    if (!gardens || gardens.length === 0) continue;

    // Collect all plantings for the current season across all gardens
    const gardenIds = (gardens as { id: string; name: string }[]).map(g => g.id);
    const { data: plantings } = await sb
      .from('plantings')
      .select('garden_id, plant_id')
      .in('garden_id', gardenIds)
      .eq('year', year)
      .eq('season', season);

    if (!plantings || plantings.length === 0) continue;

    // Build task list for this month
    const sow:        string[] = [];
    const transplant: string[] = [];
    const harvest:    string[] = [];
    const seen = new Set<string>();

    for (const p of plantings as { garden_id: string; plant_id: string }[]) {
      if (seen.has(p.plant_id)) continue;
      seen.add(p.plant_id);
      const tasks = PLANT_TASKS[p.plant_id];
      if (!tasks) continue;
      if (tasks.sow?.includes(month))        sow.push(p.plant_id);
      if (tasks.transplant?.includes(month)) transplant.push(p.plant_id);
      if (tasks.harvest?.includes(month))    harvest.push(p.plant_id);
    }

    if (sow.length === 0 && transplant.length === 0 && harvest.length === 0) continue;

    const plantedList = [...seen].join(', ');
    const taskLines = [
      sow.length        && `🌱 <strong>Sembrar:</strong> ${sow.join(', ')}`,
      transplant.length && `🪴 <strong>Trasplantar:</strong> ${transplant.join(', ')}`,
      harvest.length    && `🧺 <strong>Cosechar:</strong> ${harvest.join(', ')}`,
    ].filter(Boolean).join('<br>');

    const html = `
<!DOCTYPE html><html><body style="font-family:Georgia,serif;max-width:580px;margin:auto;padding:32px;color:#2A2010;background:#F5F0E4;">
<h1 style="color:#3A6020;font-size:2rem;margin-bottom:4px;">El Huerto</h1>
<p style="color:#7A6A50;font-style:italic;margin-top:0;">Recordatorio mensual · ${monthName} ${year}</p>
<hr style="border-color:#C5B89A;margin:20px 0;">
<p>Hola 👋 — Esto es lo que toca este mes en tu huerto:</p>
<div style="background:white;border:1px solid #C5B89A;border-radius:10px;padding:20px 24px;margin:20px 0;line-height:2;">
${taskLines}
</div>
<p style="color:#7A6A50;font-size:0.9rem;">Tienes plantados: ${plantedList}</p>
<a href="${APP_URL}" style="display:inline-block;margin-top:16px;padding:10px 24px;background:#3A6020;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Abrir mi huerto →</a>
<hr style="border-color:#C5B89A;margin:32px 0 16px;">
<p style="color:#7A6A50;font-size:0.78rem;">Para desactivar estos recordatorios, accede a tu cuenta y desactívalos desde el menú de usuario.</p>
</body></html>`;

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'El Huerto <recordatorios@tudominio.com>', // ← change to your verified Resend domain
        to: reminder.email,
        subject: `🌱 Tu huerto en ${monthName} — qué toca este mes`,
        html,
      }),
    });

    if (res.ok) sent++;
    else console.error('Resend error:', await res.text());
  }

  return new Response(JSON.stringify({ sent }), { status: 200 });
});
