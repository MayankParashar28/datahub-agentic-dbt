import { DatasetMetadata, GeneratedArtifacts, WritebackResult } from '../types';

const API_BASE = '/api';

export async function fetchHealthStatus() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchDatasets(): Promise<{ urn: string; name: string; platform: string; description?: string; domain?: string }[]> {
  const res = await fetch(`${API_BASE}/datasets`);
  if (!res.ok) throw new Error('Failed to fetch dataset list');
  return res.json();
}

export async function inspectDataset(urn: string): Promise<DatasetMetadata> {
  const res = await fetch(`${API_BASE}/datasets/inspect?urn=${encodeURIComponent(urn)}`);
  if (!res.ok) throw new Error('Failed to inspect dataset metadata');
  return res.json();
}

export async function generateDbtModel(
  datasetUrn: string,
  secondaryDatasetUrn?: string,
  customInstructions?: string,
  llmProvider = 'claude'
): Promise<GeneratedArtifacts> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataset_urn: datasetUrn,
      secondary_dataset_urn: secondaryDatasetUrn || null,
      custom_instructions: customInstructions || null,
      llm_provider: llmProvider
    })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Generation failed');
  }
  return res.json();
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
