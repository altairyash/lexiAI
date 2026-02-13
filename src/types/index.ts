export interface Namespace {
  value: string;
  label: string;
}

export interface Cache {
  [key: string]: string;
}

export interface QueryResponse {
  answer: string;
  sources?: string[]; // Future proofing
}

export interface AutoDetectResponse {
  namespace: string | null;
}
