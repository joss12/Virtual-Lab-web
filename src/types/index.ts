export interface AuthResponse {
  token: string;
}

export interface User {
  id: string;
  email: string;
}

export interface QuizScore {
  id: string;
  user_id: string;
  score: number;
  total: number;
  component: string | null;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  component: string;
  tabs_visited: string[];
  completed: boolean;
  updated_at: string;
}

export interface SaveScoreRequest {
  score: number;
  total: number;
  component?: string;
}

export interface UpdateProgressRequest {
  tabs_visited: string[];
  completed: boolean;
}


