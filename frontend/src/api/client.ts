import { DatasetMetadata, GeneratedArtifacts, WritebackResult } from '../types';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';
const API_BASE = `${BASE_URL.replace(/\/$/, '')}/api`;

export async function fetchHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  } catch {
    // Fallback if backend URL differs slightly
    const fallback = await fetch('/api/health');
    if (!fallback.ok) throw new Error('Health check failed');
    return fallback.json();
  }
}

export async function fetchDatasets(): Promise<{ urn: string; name: string; platform: string; description?: string; domain?: string }[]> {
  try {
    const res = await fetch(`${API_BASE}/datasets`);
    if (!res.ok) throw new Error('Failed to fetch dataset list');
    return res.json();
  } catch {
    const fallback = await fetch('/api/datasets');
    if (!fallback.ok) throw new Error('Failed to fetch dataset list');
    return fallback.json();
  }
}

export async function inspectDataset(urn: string): Promise<DatasetMetadata> {
  try {
    const res = await fetch(`${API_BASE}/datasets/inspect?urn=${encodeURIComponent(urn)}`);
    if (!res.ok) throw new Error('Failed to inspect dataset metadata');
    return res.json();
  } catch {
    const fallback = await fetch(`/api/datasets/inspect?urn=${encodeURIComponent(urn)}`);
    if (!fallback.ok) throw new Error('Failed to inspect dataset metadata');
    return fallback.json();
  }
}

export async function generateDbtModel(
  datasetUrn: string,
  secondaryDatasetUrn?: string,
  customInstructions?: string,
  llmProvider = 'claude'
): Promise<GeneratedArtifacts> {
  const payload = {
    dataset_urn: datasetUrn,
    secondary_dataset_urn: secondaryDatasetUrn || null,
    custom_instructions: customInstructions || null,
    llm_provider: llmProvider
  };

  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Generation failed');
    }
    return res.json();
  } catch (err: any) {
    const fallback = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!fallback.ok) {
      const err = await fallback.json();
      throw new Error(err.detail || 'Generation failed');
    }
    return fallback.json();
  }
}

export async function publishToDataHub(artifacts: GeneratedArtifacts): Promise<WritebackResult> {
  const res = await fetch(`${API_BASE}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(artifacts)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Publish writeback failed');
  }
  return res.json();
}

export async function downloadProjectZip(artifacts: GeneratedArtifacts): Promise<void> {
  const res = await fetch(`${API_BASE}/export/zip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(artifacts)
  });
  if (!res.ok) {
    throw new Error('Failed to export ZIP archive');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dbt_project_${artifacts.model_name}.zip`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function sendChatMessage(datasetUrn: string, message: string): Promise<{ reply: string; dataset_urn: string; suggestions: string[] }> {
  const targetUrn = datasetUrn || 'urn:li:dataset:(urn:li:dataPlatform:postgres,fiction-retail.orders,PROD)';
  const payload = { dataset_urn: targetUrn, message: message };

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return res.json();
    }

    // Try fallback endpoints if primary URL returned non-200
    const endpoints = ['/api/chat', '/chat', 'http://localhost:8000/api/chat'];
    for (const ep of endpoints) {
      try {
        const fallbackRes = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (fallbackRes.ok) {
          return fallbackRes.json();
        }
      } catch {
        continue;
      }
    }

    throw new Error(`Chat API HTTP ${res.status}: Endpoint Not Found`);
  } catch (err: any) {
    throw new Error(err.message || 'Chat request failed');
  }
}
