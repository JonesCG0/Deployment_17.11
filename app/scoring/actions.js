'use server'

import { supabase } from '@/lib/db';

export async function runScoringJob() {
  try {
    // Fetch summary of fraud predictions from Supabase
    // Predictions are written to the orders table by the Jupyter notebook pipeline
    const { data, error } = await supabase
      .from('orders')
      .select('is_fraud, risk_score')
      .not('is_fraud', 'is', null);

    if (error) throw new Error(error.message);

    const total = data.length;
    const flagged = data.filter(r => r.is_fraud === true).length;
    const avgRisk = total > 0
      ? (data.reduce((sum, r) => sum + (r.risk_score || 0), 0) / total).toFixed(4)
      : '0.0000';

    const stdout = [
      `Scoring complete. Predictions loaded from Supabase.`,
      `Orders scored: ${total}`,
      `Flagged as fraud: ${flagged}`,
      `Average risk score: ${avgRisk}`,
    ].join('\n');

    return { success: true, stdout, stderr: '' };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Execution failed',
      stderr: '',
      stdout: '',
    };
  }
}
