export interface Test {
  id: number;
  gun_model: string;
  caliber: string;
  ammunition_type: string;
  mag_capacity: number;
  string_length: number;
  planned_rounds: number;
  lubrication_interval: number;
  cleaning_interval: number;
  measurement_interval: number;
  status: 'active' | 'completed';
  current_rounds: number;
  created_at: string;
}

export interface Stoppage {
  mag_number: number;
  round_number: number;
  stoppage_type: string;
  comments: string;
}

export interface StringData {
  test_id: number;
  shooter_name: string;
  cumulative_rounds_start: number;
  cumulative_rounds_end: number;
  notes: string;
  stoppages: Stoppage[];
}

export interface Measurement {
  test_id: number;
  cumulative_rounds: number;
  type: string; // measurement, cleaning, lubrication
  performed_by?: string;
  headspace?: number;
  firing_pin_indent?: number;
  trigger_weight?: number;
  comments?: string;
}
