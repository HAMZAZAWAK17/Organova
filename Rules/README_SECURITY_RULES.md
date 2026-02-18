# 🔐 SECURITY REQUIREMENTS – MANDATORY RULES

## ⚠️ IMPORTANT

All future development, prompts, features, and implementations related to this project  **MUST strictly follow the security rules below** .

No exceptions.

---

## 🛡 OWASP-Based Security Requirements

### 1️⃣ Input Sanitization

* ALL user inputs must be sanitized.
* This includes:
  * Forms
  * Search fields
  * URLs
  * API request bodies
* No raw input should ever be processed without validation.

---

### 2️⃣ Input Validation

* Inputs must be validated on:
  * Frontend
  * Backend
* Invalid or unexpected data must be rejected.
* Trust nothing coming from the client.

---

### 3️⃣ Rate Limiting

* Every API endpoint must implement rate limiting.
* Protection against:
  * Brute force attacks
  * Spam
  * API abuse
* No public endpoint should be left unprotected.

---

### 4️⃣ Secrets Management

* API keys must NEVER be hardcoded.
* Sensitive credentials must use environment variables.
* No secrets should appear in source code.

---

### 5️⃣ SQL Injection Prevention

* Database queries must use parameterized queries.
* No dynamic query concatenation using raw user input.
* All database interactions must prevent injection risks.

---

## 🚨 Enforcement Policy

* Any feature that does not comply with these rules must be rejected.
* Security takes priority over speed of development.
* Every new prompt or feature must respect these conditions before implementation.

---

## 🎯 Objective

Ensure that the entire application architecture remains:

* Secure
* Scalable
* Protected against common web vulnerabilities
* Aligned with OWASP best practices
