import aiService from '../services/aiService.js';

const SPEC_SCHEMA = {
  required: ['title', 'type', 'description', 'version'],
  sections: ['overview', 'dataModel', 'apiEndpoints', 'uiComponents', 'businessRules', 'validation', 'security']
};

class SpecEngine {
  constructor() {
    this.specs = new Map();
  }

  async validate(specContent) {
    const errors = [];
    const warnings = [];

    const spec = typeof specContent === 'string' ? this._parseSpec(specContent) : specContent;
    if (!spec) {
      return { valid: false, errors: ['Unable to parse spec file'], warnings: [] };
    }

    for (const field of SPEC_SCHEMA.required) {
      if (!spec[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    for (const section of SPEC_SCHEMA.sections) {
      if (!spec[section] && !spec.sections?.includes(section)) {
        warnings.push(`Recommended section missing: ${section}`);
      }
    }

    if (spec.version && !/^\d+\.\d+\.\d+$/.test(spec.version)) {
      warnings.push(`Version format should be semver (e.g., 1.0.0), got "${spec.version}"`);
    }

    if (spec.dataModel) {
      const modelErrors = this._validateDataModel(spec.dataModel);
      errors.push(...modelErrors);
    }

    if (spec.apiEndpoints) {
      const apiErrors = this._validateApiEndpoints(spec.apiEndpoints);
      errors.push(...apiErrors);
    }

    if (errors.length === 0) {
      const aiReview = await this._aiReview(spec);
      if (aiReview) {
        warnings.push(...aiReview.suggestions.map(s => `AI Suggestion: ${s}`));
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      spec
    };
  }

  async generateTemplate(featureType) {
    const templates = {
      'api': {
        title: 'Feature Title',
        type: 'api',
        description: 'Description of the API feature',
        version: '1.0.0',
        author: '',
        overview: 'Brief overview of the feature',
        dataModel: {
          entities: [
            {
              name: 'EntityName',
              fields: [
                { name: 'fieldName', type: 'String', required: true, description: '' }
              ],
              relationships: []
            }
          ]
        },
        apiEndpoints: [
          {
            method: 'GET',
            path: '/api/v1/resource',
            description: '',
            requestBody: null,
            response: { status: 200, schema: {} },
            auth: true,
            roles: ['admin']
          }
        ],
        businessRules: [],
        validation: [],
        security: { auth: true, roles: [], rateLimit: false }
      },
      'ui': {
        title: 'Feature Title',
        type: 'ui',
        description: 'Description of the UI feature',
        version: '1.0.0',
        author: '',
        overview: 'Brief overview of the feature',
        uiComponents: [
          {
            name: 'ComponentName',
            type: 'page | modal | form | table | card',
            props: [],
            state: [],
            events: [],
            layout: 'description of layout'
          }
        ],
        dataModel: {
          entities: []
        },
        apiEndpoints: [],
        businessRules: [],
        validation: [],
        security: { auth: true, roles: [] }
      },
      'model': {
        title: 'Data Model Title',
        type: 'model',
        description: 'Description of the data model',
        version: '1.0.0',
        author: '',
        overview: 'Brief overview',
        dataModel: {
          entities: [
            {
              name: 'EntityName',
              collection: 'entity_names',
              fields: [
                { name: '_id', type: 'ObjectId', auto: true },
                { name: 'name', type: 'String', required: true, unique: false, index: true },
                { name: 'createdAt', type: 'Date', auto: true }
              ],
              timestamps: true,
              softDelete: false,
              relationships: [
                { type: 'belongsTo', entity: 'OtherEntity', foreignKey: 'otherId' }
              ],
              indexes: [{ fields: ['name'], unique: false }]
            }
          ],
          enums: [],
          constants: []
        },
        businessRules: [],
        validation: []
      }
    };

    return templates[featureType] || templates.api;
  }

  async checkCompleteness(spec) {
    const missing = [];
    const incomplete = [];

    if (spec.dataModel?.entities) {
      for (const entity of spec.dataModel.entities) {
        if (!entity.fields || entity.fields.length === 0) {
          incomplete.push(`Entity "${entity.name}" has no fields defined`);
        }
        for (const field of entity.fields || []) {
          if (!field.type) {
            incomplete.push(`Field "${field.name}" in "${entity.name}" has no type`);
          }
        }
      }
    }

    if (spec.apiEndpoints) {
      for (const endpoint of spec.apiEndpoints) {
        if (!endpoint.method || !endpoint.path) {
          incomplete.push(`Endpoint missing method or path`);
        }
        if (!endpoint.response) {
          incomplete.push(`Endpoint ${endpoint.method} ${endpoint.path} missing response definition`);
        }
      }
    }

    if (spec.businessRules && spec.businessRules.length === 0) {
      missing.push('No business rules defined');
    }

    if (spec.security) {
      if (!spec.security.auth !== undefined && spec.security.auth) {
        if (!spec.security.roles || spec.security.roles.length === 0) {
          incomplete.push('Auth enabled but no roles specified');
        }
      }
    }

    return {
      complete: missing.length === 0 && incomplete.length === 0,
      missing,
      incomplete,
      completenessScore: 1 - (missing.length + incomplete.length) / Math.max(missing.length + incomplete.length + 5, 1)
    };
  }

  async suggestImprovements(spec) {
    const suggestions = [];

    if (spec.dataModel?.entities) {
      for (const entity of spec.dataModel.entities) {
        if (!entity.timestamps) {
          suggestions.push(`Consider adding timestamps to entity "${entity.name}"`);
        }
        if (!entity.relationships || entity.relationships.length === 0) {
          suggestions.push(`Entity "${entity.name}" has no relationships defined`);
        }
      }
    }

    if (spec.apiEndpoints) {
      const methods = spec.apiEndpoints.map(e => e.method);
      if (!methods.includes('PATCH') && methods.includes('PUT')) {
        suggestions.push('Consider using PATCH instead of PUT for partial updates');
      }
      if (!methods.includes('DELETE')) {
        suggestions.push('No DELETE endpoints defined - consider if soft delete is needed');
      }
    }

    if (!spec.validation || spec.validation.length === 0) {
      suggestions.push('Add validation rules section for input validation');
    }

    if (!spec.security?.rateLimit) {
      suggestions.push('Consider adding rate limiting to API endpoints');
    }

    const aiSuggestions = await this._aiSuggest(spec);
    return [...suggestions, ...aiSuggestions];
  }

  async ensureConsistency(specs) {
    const issues = [];
    const entityMap = new Map();

    for (const spec of specs) {
      if (spec.dataModel?.entities) {
        for (const entity of spec.dataModel.entities) {
          if (entityMap.has(entity.name)) {
            const existing = entityMap.get(entity.name);
            const existingFields = new Set(existing.fields.map(f => f.name));
            const currentFields = new Set((entity.fields || []).map(f => f.name));

            for (const field of existingFields) {
              if (!currentFields.has(field)) {
                issues.push(`Entity "${entity.name}" missing field "${field}" from spec "${spec.title}"`);
              }
            }
          } else {
            entityMap.set(entity.name, entity);
          }
        }
      }
    }

    return {
      consistent: issues.length === 0,
      issues,
      entityMap: Object.fromEntries(entityMap)
    };
  }

  async generateAPIContract(spec) {
    if (!spec.apiEndpoints || spec.apiEndpoints.length === 0) {
      return { error: 'No API endpoints defined in spec' };
    }

    const systemPrompt = `You are an API contract generator. Generate an OpenAPI 3.0 specification from the following spec file.

Return a valid OpenAPI 3.0 JSON object including paths, schemas, and request/response definitions.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(spec, null, 2) }
      ], { temperature: 0.1 });

      const contract = typeof response === 'object' ? response : JSON.parse(response);
      return {
        openapi: '3.0.0',
        info: { title: spec.title, version: spec.version, description: spec.description },
        ...contract
      };
    } catch (error) {
      console.error('SpecEngine: API contract generation failed', error.message);
      return this._basicContract(spec);
    }
  }

  _validateDataModel(dataModel) {
    const errors = [];
    if (!dataModel.entities || !Array.isArray(dataModel.entities)) {
      errors.push('dataModel must contain an entities array');
      return errors;
    }

    const entityNames = new Set();
    for (const entity of dataModel.entities) {
      if (!entity.name) {
        errors.push('Entity missing name');
        continue;
      }
      if (entityNames.has(entity.name)) {
        errors.push(`Duplicate entity name: ${entity.name}`);
      }
      entityNames.add(entity.name);

      if (entity.fields && Array.isArray(entity.fields)) {
        for (const field of entity.fields) {
          if (!field.name) {
            errors.push(`Field in entity "${entity.name}" missing name`);
          }
          if (field.required && !field.default && field.type !== 'ObjectId') {
            if (!field.description) {
              errors.push(`Required field "${field.name}" in "${entity.name}" should have a description`);
            }
          }
        }
      }
    }

    return errors;
  }

  _validateApiEndpoints(apiEndpoints) {
    const errors = [];
    if (!Array.isArray(apiEndpoints)) {
      errors.push('apiEndpoints must be an array');
      return errors;
    }

    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    const paths = new Set();

    for (const endpoint of apiEndpoints) {
      if (!validMethods.includes(endpoint.method)) {
        errors.push(`Invalid HTTP method: ${endpoint.method}`);
      }
      if (!endpoint.path) {
        errors.push('Endpoint missing path');
      } else if (!endpoint.path.startsWith('/')) {
        errors.push(`Path must start with /: ${endpoint.path}`);
      }
      const pathKey = `${endpoint.method}:${endpoint.path}`;
      if (paths.has(pathKey)) {
        errors.push(`Duplicate endpoint: ${pathKey}`);
      }
      paths.add(pathKey);
    }

    return errors;
  }

  async _aiReview(spec) {
    try {
      const response = await aiService.generateResponse([
        {
          role: 'system',
          content: 'You are a spec review AI. Review the following spec and suggest improvements. Return only a JSON object with a "suggestions" array of strings. If nothing to suggest, return empty array.'
        },
        { role: 'user', content: JSON.stringify(spec, null, 2) }
      ], { temperature: 0.2 });

      const result = typeof response === 'object' ? response : JSON.parse(response);
      return { suggestions: result.suggestions || [] };
    } catch {
      return null;
    }
  }

  async _aiSuggest(spec) {
    try {
      const response = await aiService.generateResponse([
        {
          role: 'system',
          content: 'Review this spec and suggest specific improvements. Return a JSON object with a "suggestions" array of strings.'
        },
        { role: 'user', content: JSON.stringify(spec, null, 2) }
      ], { temperature: 0.3 });

      const result = typeof response === 'object' ? response : JSON.parse(response);
      return result.suggestions || [];
    } catch {
      return [];
    }
  }

  _basicContract(spec) {
    const paths = {};
    for (const endpoint of spec.apiEndpoints || []) {
      const method = endpoint.method.toLowerCase();
      const path = endpoint.path;
      if (!paths[path]) paths[path] = {};
      paths[path][method] = {
        summary: endpoint.description || `${endpoint.method} ${endpoint.path}`,
        responses: {
          [endpoint.response?.status || 200]: {
            description: 'Success',
            content: { 'application/json': { schema: { type: 'object' } } }
          }
        }
      };
    }

    return {
      openapi: '3.0.0',
      info: { title: spec.title || 'API', version: spec.version || '1.0.0' },
      paths
    };
  }

  _parseSpec(content) {
    try {
      return JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try { return JSON.parse(jsonMatch[1]); } catch { return null; }
      }
      return null;
    }
  }
}

export default SpecEngine;
