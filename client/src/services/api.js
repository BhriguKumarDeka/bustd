/**
 * BUSTD Client API Service
 * Handles all REST endpoints with consistent error handling and JSON envelopes
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (options.responseType === 'blob') {
    if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to download file`);
    return await response.blob();
  }

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // System status
  async getSystemStatus() {
    return request('/system/status');
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },

  async getProduct(id) {
    return request(`/products/${id}`);
  },

  async createProduct(productData) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  // Rules
  async getRules() {
    return request('/rules');
  },

  async toggleRuleStatus(ruleId, status) {
    return request(`/rules/${ruleId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Inspections
  async getInspections(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/inspections${query ? `?${query}` : ''}`);
  },

  async getInspection(id) {
    return request(`/inspections/${id}`);
  },

  async createInspection(data) {
    return request('/inspections', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async uploadAssets(inspectionId, files, panel = 'front') {
    const formData = new FormData();
    formData.append('panel', panel);
    for (const file of files) {
      formData.append('files', file);
    }
    return request(`/inspections/${inspectionId}/assets`, {
      method: 'POST',
      body: formData
    });
  },

  async removeAsset(inspectionId, assetId) {
    return request(`/inspections/${inspectionId}/assets/${assetId}`, {
      method: 'DELETE'
    });
  },

  async runAnalysis(inspectionId) {
    return request(`/inspections/${inspectionId}/analyze`, {
      method: 'POST'
    });
  },

  async reviewFinding(inspectionId, findingId, { action, dismissReason, notes }) {
    return request(`/inspections/${inspectionId}/findings/${findingId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action, dismissReason, notes })
    });
  },

  async correctField(inspectionId, fieldKey, { correctedValue, status }) {
    return request(`/inspections/${inspectionId}/fields/${fieldKey}/correct`, {
      method: 'PATCH',
      body: JSON.stringify({ correctedValue, status })
    });
  },

  async finalizeInspection(inspectionId, { decision, notes }) {
    return request(`/inspections/${inspectionId}/finalize`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes })
    });
  },

  async downloadReportPdf(inspectionId, inspectionNumber) {
    const blob = await request(`/inspections/${inspectionId}/report?format=pdf`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BUSTD_Report_${inspectionNumber || inspectionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },

  // Audit
  async getAuditEvents(inspectionId) {
    const query = inspectionId ? `?inspectionId=${inspectionId}` : '';
    return request(`/audit-events${query}`);
  }
};
