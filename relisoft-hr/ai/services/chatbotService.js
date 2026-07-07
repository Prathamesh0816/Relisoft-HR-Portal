import aiService from './aiService.js';

const MAX_HISTORY = 50;

class ChatbotService {
  constructor() {
    this.conversations = new Map();
    this.fallbackResponses = [
      "I'm sorry, I couldn't find an answer to that. Could you rephrase or contact HR directly?",
      "I don't have enough information to answer that. Please check with your HR representative.",
      "That query is outside my current scope. I can help with HR policies, leave, attendance, and employee info."
    ];
  }

  getOrCreateConversation(sessionId) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        id: sessionId,
        history: [],
        context: {},
        createdAt: new Date(),
        lastActivity: new Date()
      });
    }
    return this.conversations.get(sessionId);
  }

  async processMessage(sessionId, userMessage, context = {}) {
    const conversation = this.getOrCreateConversation(sessionId);
    conversation.lastActivity = new Date();

    if (context.policies && !conversation.context.policies) {
      conversation.context.policies = context.policies;
    }
    if (context.employeeData) {
      conversation.context.employeeData = context.employeeData;
    }

    const intent = await this._detectIntent(userMessage, conversation);

    let response;
    switch (intent.type) {
      case 'leave_apply':
        response = await this._handleLeaveApplication(userMessage, conversation);
        break;
      case 'leave_balance':
        response = await this._handleLeaveBalance(userMessage, conversation);
        break;
      case 'attendance':
        response = await this._handleAttendanceQuery(userMessage, conversation);
        break;
      case 'employee_info':
        response = await this._handleEmployeeInfo(userMessage, conversation);
        break;
      case 'payroll':
        response = await this._handlePayrollQuery(userMessage, conversation);
        break;
      case 'policy':
        response = await this._handlePolicyQuery(userMessage, conversation);
        break;
      default:
        response = await this._handleGeneralQuery(userMessage, conversation);
    }

    this._addToHistory(conversation, { role: 'user', content: userMessage });
    this._addToHistory(conversation, { role: 'assistant', content: response });

    return {
      response,
      intent: intent.type,
      confidence: intent.confidence,
      conversationId: sessionId,
      requiresFollowUp: intent.type === 'leave_apply'
    };
  }

  async _detectIntent(message, conversation) {
    const recentHistory = conversation.history.slice(-6);
    const contextMessages = recentHistory.map(h => `${h.role}: ${h.content}`).join('\n');

    const systemPrompt = `You are an HR intent classifier. Classify the user's latest message into one of these intents:
- leave_apply: User wants to apply for leave (vacation, sick, casual, etc.)
- leave_balance: User asking about remaining leave balance
- attendance: User asking about attendance records
- employee_info: User asking about employee details (their own or others)
- payroll: User asking about salary, payslips, deductions
- policy: User asking about company policies, rules, benefits
- general: Any other HR-related query

Return JSON: {"type": "intent_name", "confidence": 0.0-1.0}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Previous conversation:\n${contextMessages}\n\nLatest message: ${message}` }
      ], { temperature: 0.1 });

      const result = typeof response === 'object' ? response : JSON.parse(response);
      return { type: result.type || 'general', confidence: result.confidence || 0.5 };
    } catch {
      return { type: 'general', confidence: 0.3 };
    }
  }

  async _handleLeaveApplication(message, conversation) {
    const systemPrompt = `You are an HR leave assistant. Extract leave details from the user message and create a leave application.
Current context: ${JSON.stringify(conversation.context)}
Required fields: leaveType (CL/SL/EL/Maternity/Paternity/LOP/WFH), fromDate, toDate, reason, employeeId.

If any required field is missing, ask for it. Return JSON with extracted fields and any missing fields.`;

    const response = await aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ], { temperature: 0.2 });

    const parsed = typeof response === 'object' ? response : JSON.parse(response);

    if (parsed.missingFields && parsed.missingFields.length > 0) {
      return `To process your leave request, I need: ${parsed.missingFields.join(', ')}. Please provide the missing details.`;
    }

    return `Leave application submitted:
Type: ${parsed.leaveType}
From: ${parsed.fromDate}
To: ${parsed.toDate}
Reason: ${parsed.reason}

Your leave has been logged and is pending approval. You will be notified once reviewed.`;
  }

  async _handleLeaveBalance(message, conversation) {
    const employeeData = conversation.context.employeeData;

    if (!employeeData) {
      return "I need your employee information to check leave balance. Please provide your employee ID or name.";
    }

    const systemPrompt = `You are an HR assistant. The employee has the following leave balances:
${JSON.stringify(employeeData.leaveBalance || {}, null, 2)}

Answer their query about leave balance in a helpful, conversational way.`;

    return aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ], { temperature: 0.3 });
  }

  async _handleAttendanceQuery(message, conversation) {
    const employeeData = conversation.context.employeeData;

    if (!employeeData) {
      return "I need your employee information to check attendance. Please provide your employee ID.";
    }

    const systemPrompt = `You are an HR assistant. The employee has the following attendance data:
${JSON.stringify(employeeData.attendance || {}, null, 2)}

Answer their query about attendance in a helpful way. Include stats like present days, absences, late arrivals, and attendance percentage if available.`;

    return aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ], { temperature: 0.3 });
  }

  async _handleEmployeeInfo(message, conversation) {
    const employeeData = conversation.context.employeeData;

    if (!employeeData) {
      return "I need to identify you first. Please provide your employee ID or full name.";
    }

    const systemPrompt = `You are an HR assistant. Answer the employee's query based on their profile:
${JSON.stringify(employeeData, null, 2)}

Be helpful and professional. Only share information that is appropriate for the employee to know.`;

    return aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ], { temperature: 0.3 });
  }

  async _handlePayrollQuery(message, conversation) {
    const employeeData = conversation.context.employeeData;

    if (!employeeData) {
      return "For payroll queries, I need to verify your identity first. Please provide your employee ID.";
    }

    const systemPrompt = `You are an HR payroll assistant. Answer the employee's payroll query based on this data:
${JSON.stringify(employeeData.payroll || employeeData, null, 2)}

Include relevant details about salary, deductions, and next pay date if available.`;

    return aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ], { temperature: 0.3 });
  }

  async _handlePolicyQuery(message, conversation) {
    const policies = conversation.context.policies;

    if (!policies) {
      return "I don't have the company policies loaded. Please contact HR for policy-related questions.";
    }

    const systemPrompt = `You are an HR policy assistant. Answer the employee's question based on company policies:
${JSON.stringify(policies, null, 2)}

Provide accurate policy information and cite specific policy sections when relevant. If the answer isn't in the policies, say so.`;

    return aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ], { temperature: 0.2 });
  }

  async _handleGeneralQuery(message, conversation) {
    const systemPrompt = `You are ReliBot, the ReliSoft HR assistant. You help employees with:
- Leave management (apply, check balance)
- Attendance tracking
- Employee information
- Payroll queries
- HR policies and procedures

Be friendly, professional, and helpful. If you cannot help, suggest contacting HR.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        ...conversation.history.slice(-6).map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ], { temperature: 0.4 });

      return response;
    } catch {
      return this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
    }
  }

  _addToHistory(conversation, entry) {
    conversation.history.push({
      ...entry,
      timestamp: new Date()
    });

    if (conversation.history.length > MAX_HISTORY) {
      conversation.history = conversation.history.slice(-MAX_HISTORY);
    }
  }

  getHistory(sessionId) {
    const conversation = this.conversations.get(sessionId);
    return conversation ? conversation.history : [];
  }

  clearHistory(sessionId) {
    this.conversations.delete(sessionId);
  }

  setContext(sessionId, key, value) {
    const conversation = this.getOrCreateConversation(sessionId);
    conversation.context[key] = value;
  }

  cleanupInactiveSessions(maxAgeMinutes = 60) {
    const now = new Date();
    for (const [id, conversation] of this.conversations) {
      const ageMinutes = (now - conversation.lastActivity) / 60000;
      if (ageMinutes > maxAgeMinutes) {
        this.conversations.delete(id);
      }
    }
  }
}

export default new ChatbotService();
