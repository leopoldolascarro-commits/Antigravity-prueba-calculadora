/**
 * 🎓 ARCHIVO PRINCIPAL (main.js)
 * 
 * Controlador de la interfaz basado en la plantilla oficial PRESUPUESTO AGENTE KW Santa Ana,
 * con DOBLE PLAN EN EL PASO 5:
 * 1. Plan de Piso Mínimo de Supervivencia (No Negociables + Operación + Impuestos + Costo Ventas)
 * 2. Plan Completo de Sueños (No Negociables + Negociables + Operación + Impuestos + Costo Ventas)
 */

import { agentStore } from './store/agentStore.js';
import { formatCOP, parseCOP, setupCurrencyInput } from './utils/formatters.js';

let currentStep = 1;

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initStepNavigation();
  initStep1Inputs();
  initStep2Budget();
  initStep3DualMetrics();
  initStep4DualRatios();
  renderCurrentStep();
});

/* ==========================================================================
   1. MANEJO DE TEMA (CLARO POR DEFECTO / OSCURO OPCIONAL)
   ========================================================================== */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;
  
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('theme-dark');
    document.body.classList.toggle('theme-light');
    
    const isDark = document.body.classList.contains('theme-dark');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
    themeBtn.title = isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro';
  });
}

/* ==========================================================================
   2. WIZARD STEPPER
   ========================================================================== */
function initStepNavigation() {
  document.querySelectorAll('.step-item').forEach(item => {
    item.addEventListener('click', () => {
      const step = parseInt(item.getAttribute('data-step'), 10);
      goToStep(step);
    });
  });

  document.getElementById('btn-goto-step2')?.addEventListener('click', () => goToStep(2));
  document.getElementById('btn-backto-step1')?.addEventListener('click', () => goToStep(1));
  document.getElementById('btn-goto-step3')?.addEventListener('click', () => goToStep(3));
  document.getElementById('btn-backto-step2')?.addEventListener('click', () => goToStep(2));
  document.getElementById('btn-goto-step4')?.addEventListener('click', () => goToStep(4));
  document.getElementById('btn-backto-step3')?.addEventListener('click', () => goToStep(3));
  document.getElementById('btn-goto-step5')?.addEventListener('click', () => goToStep(5));
  document.getElementById('btn-backto-step4')?.addEventListener('click', () => goToStep(4));
  document.getElementById('btn-print-report')?.addEventListener('click', () => window.print());
}

function goToStep(step) {
  if (step < 1 || step > 5) return;
  currentStep = step;
  renderCurrentStep();
}

function renderCurrentStep() {
  document.querySelectorAll('.wizard-step-card').forEach((card, index) => {
    card.classList.toggle('active', index + 1 === currentStep);
  });

  document.querySelectorAll('.step-item').forEach((item, index) => {
    const stepNum = index + 1;
    item.classList.toggle('active', stepNum === currentStep);
    item.classList.toggle('completed', stepNum < currentStep);
  });

  if (currentStep === 1) renderStep1Summary();
  if (currentStep === 2) renderStep2Budget();
  if (currentStep === 5) renderStep5Results();
}

/* ==========================================================================
   3. PASO 1: META DE INGRESO NETO
   ========================================================================== */
function initStep1Inputs() {
  const inputMonthly = document.getElementById('net-income-monthly');
  const inputYearly = document.getElementById('net-income-yearly');
  const state = agentStore.getState();

  if (inputMonthly && inputYearly) {
    inputMonthly.value = formatCOP(state.netIncome.monthly);
    inputYearly.value = formatCOP(state.netIncome.yearly);

    setupCurrencyInput(inputMonthly, (val) => {
      agentStore.setNetIncomeMonthly(val);
      inputYearly.value = formatCOP(agentStore.getState().netIncome.yearly);
      renderStep1Summary();
    });

    setupCurrencyInput(inputYearly, (val) => {
      agentStore.setNetIncomeYearly(val);
      inputMonthly.value = formatCOP(agentStore.getState().netIncome.monthly);
      renderStep1Summary();
    });
  }
}

function renderStep1Summary() {
  const state = agentStore.getState();
  const m = document.getElementById('summary-step1-monthly');
  const y = document.getElementById('summary-step1-yearly');
  if (m) m.textContent = formatCOP(state.netIncome.monthly);
  if (y) y.textContent = formatCOP(state.netIncome.yearly);
}

/* ==========================================================================
   4. PASO 2: PRESUPUESTO OFICIAL AGENTE KW (KW SANTA ANA)
   ========================================================================== */
function initStep2Budget() {
  const tabBtns = document.querySelectorAll('.tabs-header .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = `tab-${btn.getAttribute('data-tab')}`;
      document.getElementById(tabId)?.classList.add('active');
    });
  });

  const monthsInput = document.getElementById('months-remaining-input');
  if (monthsInput) {
    monthsInput.value = agentStore.getState().monthsRemainingInYear || 12;
    monthsInput.addEventListener('input', (e) => {
      agentStore.setMonthsRemaining(e.target.value);
      renderStep2Budget();
      renderStep1Summary();
    });
  }

  const entryMonthSelect = document.getElementById('kw-entry-month-select');
  if (entryMonthSelect) {
    entryMonthSelect.value = agentStore.getState().entryMonth || 'marzo';
    updateAnniversaryBadge();
    
    entryMonthSelect.addEventListener('change', (e) => {
      agentStore.setEntryMonth(e.target.value);
      updateAnniversaryBadge();
    });
  }

  const maxCapInput = document.getElementById('kw-max-cap-input');
  if (maxCapInput) {
    maxCapInput.value = formatCOP(agentStore.getState().kwCostOfSales.maxMarketCenterCap || 28000000);
    setupCurrencyInput(maxCapInput, (val) => {
      agentStore.setMaxMarketCenterCap(val);
      renderStep2Totals();
    });
  }

  const businessTaxesInput = document.getElementById('business-taxes-input');
  if (businessTaxesInput) {
    businessTaxesInput.value = agentStore.getState().businessTaxesPercent || 11;
    businessTaxesInput.addEventListener('input', (e) => {
      agentStore.setBusinessTaxesPercent(e.target.value);
      renderStep2Totals();
    });
  }

  document.getElementById('add-non-negotiable-expense-btn')?.addEventListener('click', () => {
    agentStore.addCustomExpense('non_negotiable', 'Nuevo Gasto No Negociable', 0);
    renderStep2Budget();
  });

  document.getElementById('add-negotiable-expense-btn')?.addEventListener('click', () => {
    agentStore.addCustomExpense('negotiable', 'Nuevo Gasto Negociable', 0);
    renderStep2Budget();
  });

  document.getElementById('add-business-expense-btn')?.addEventListener('click', () => {
    agentStore.addCustomExpense('business', 'Nuevo Gasto de Operación', 0);
    renderStep2Budget();
  });

  renderStep2Budget();
}

function updateAnniversaryBadge() {
  const badge = document.getElementById('anniversary-badge-display');
  if (badge) {
    const startMonth = agentStore.getState().anniversaryStartMonth || 'abril';
    const capitalized = startMonth.charAt(0).toUpperCase() + startMonth.slice(1);
    badge.innerHTML = `📅 Tu año de aniversario empieza el mes siguiente de la inscripción al Centro de Negocios (Inicia en <strong>${capitalized}</strong>)`;
  }
}

function renderStep2Budget() {
  const state = agentStore.getState();
  
  const nonNegListEl = document.getElementById('non-negotiable-expenses-list');
  if (nonNegListEl) {
    nonNegListEl.innerHTML = '';
    (state.nonNegotiableExpenses || []).forEach(item => {
      nonNegListEl.appendChild(createExpenseRow('non_negotiable', item));
    });
  }

  const negListEl = document.getElementById('negotiable-expenses-list');
  if (negListEl) {
    negListEl.innerHTML = '';
    (state.negotiableExpenses || []).forEach(item => {
      negListEl.appendChild(createExpenseRow('negotiable', item));
    });
  }

  const businessListEl = document.getElementById('business-expenses-list');
  if (businessListEl) {
    businessListEl.innerHTML = '';
    (state.businessExpenses || []).forEach(item => {
      businessListEl.appendChild(createExpenseRow('business', item));
    });
  }

  renderStep2Totals();
}

function createExpenseRow(category, item) {
  const months = agentStore.getState().monthsRemainingInYear || 12;
  const yearlyVal = (item.monthly || 0) * months;

  const row = document.createElement('div');
  row.className = 'expense-row';
  row.innerHTML = `
    <input type="text" class="expense-name" value="${item.name}" placeholder="Nombre del gasto">
    <div class="input-wrapper">
      <span class="currency-symbol">$</span>
      <input type="text" class="currency-input expense-amount mrea-editable" value="${formatCOP(item.monthly)}">
    </div>
    <span class="yearly-calculated-val">${formatCOP(yearlyVal)}</span>
    <button class="btn-delete" title="Eliminar gasto">🗑️</button>
  `;

  row.querySelector('.expense-name').addEventListener('change', (e) => {
    item.name = e.target.value;
    agentStore.saveToStorage();
  });

  setupCurrencyInput(row.querySelector('.expense-amount'), (val) => {
    agentStore.updateExpense(category, item.id, val);
    renderStep2Totals();
    
    const updatedYearly = val * (agentStore.getState().monthsRemainingInYear || 12);
    row.querySelector('.yearly-calculated-val').textContent = formatCOP(updatedYearly);
  });

  row.querySelector('.btn-delete').addEventListener('click', () => {
    agentStore.removeExpense(category, item.id);
    renderStep2Budget();
  });

  return row;
}

function renderStep2Totals() {
  const calc = agentStore.getCalculations();

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setTxt('total-non-negotiable-val', `${formatCOP(calc.totalNonNegotiableMonthly)} / mes`);
  setTxt('total-non-negotiable-yearly-val', `${formatCOP(calc.totalNonNegotiableYearly)} / año`);

  setTxt('total-negotiable-val', `${formatCOP(calc.totalNegotiableMonthly)} / mes`);
  setTxt('total-negotiable-yearly-val', `${formatCOP(calc.totalNegotiableYearly)} / año`);

  setTxt('total-business-val', `${formatCOP(calc.totalBusinessMonthly)} / mes`);
  setTxt('total-business-yearly-val', `${formatCOP(calc.totalBusinessYearly)} / año`);

  setTxt('total-personal-budget-val', `${formatCOP(calc.totalPersonalMonthly)} / mes`);
  setTxt('total-personal-budget-yearly-val', `${formatCOP(calc.totalPersonalYearly)} / año`);

  setTxt('floor-gci-display', `${formatCOP(calc.floorGciNeededMonthly)} / mes (${formatCOP(calc.floorGciNeededYearly)} / año)`);
}

/* ==========================================================================
   5. PASO 3: METRICAS DUALES CON SPLIT ÚNICO GLOBAL
   ========================================================================== */
function initStep3DualMetrics() {
  const state = agentStore.getState();

  const splitInput = document.getElementById('global-agent-split');
  if (splitInput) {
    splitInput.value = state.agentSplitPercent;
    splitInput.addEventListener('input', (e) => {
      agentStore.setAgentSplitPercent(e.target.value);
    });
  }

  const weeksInput = document.getElementById('work-weeks-input');
  if (weeksInput) {
    weeksInput.value = state.workWeeksYear;
    weeksInput.addEventListener('input', (e) => {
      agentStore.setWorkWeeksYear(e.target.value);
    });
  }

  const mixSlider = document.getElementById('mix-range-input');
  const salesBadge = document.getElementById('sales-mix-badge');
  const rentalsBadge = document.getElementById('rentals-mix-badge');

  if (mixSlider) {
    mixSlider.value = state.businessMix.salesPercent;
    const updateMixBadges = (val) => {
      if (salesBadge) salesBadge.textContent = `🏷️ Ventas: ${val}%`;
      if (rentalsBadge) rentalsBadge.textContent = `🔑 Arriendos: ${100 - val}%`;
    };
    updateMixBadges(mixSlider.value);

    mixSlider.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      agentStore.setBusinessMixSales(val);
      updateMixBadges(val);
    });
  }

  const salesPriceInput = document.getElementById('sales-avg-price');
  if (salesPriceInput) {
    salesPriceInput.value = formatCOP(state.salesMetrics.averagePropertyPrice);
    setupCurrencyInput(salesPriceInput, (val) => {
      state.salesMetrics.averagePropertyPrice = val;
      agentStore.saveToStorage();
    });
  }

  const salesCommInput = document.getElementById('sales-comm-percent');
  if (salesCommInput) {
    salesCommInput.value = state.salesMetrics.commissionPercent;
    salesCommInput.addEventListener('input', (e) => {
      state.salesMetrics.commissionPercent = Number(e.target.value);
      agentStore.saveToStorage();
    });
  }

  const rentalsPriceInput = document.getElementById('rentals-avg-price');
  if (rentalsPriceInput) {
    rentalsPriceInput.value = formatCOP(state.rentalMetrics.averageMonthlyRent);
    setupCurrencyInput(rentalsPriceInput, (val) => {
      state.rentalMetrics.averageMonthlyRent = val;
      agentStore.saveToStorage();
    });
  }

  const rentalsCommInput = document.getElementById('rentals-comm-months');
  if (rentalsCommInput) {
    rentalsCommInput.value = state.rentalMetrics.commissionMonths;
    rentalsCommInput.addEventListener('input', (e) => {
      state.rentalMetrics.commissionMonths = Number(e.target.value);
      agentStore.saveToStorage();
    });
  }
}

/* ==========================================================================
   6. PASO 4: EMBUDOS DUALES
   ========================================================================== */
function initStep4DualRatios() {
  const state = agentStore.getState();

  const sContacts = document.getElementById('sales-ratio-contacts');
  if (sContacts) {
    sContacts.value = state.salesRatios.contactsToAppointment;
    sContacts.addEventListener('input', (e) => {
      state.salesRatios.contactsToAppointment = Number(e.target.value);
      agentStore.saveToStorage();
    });
  }

  const sAppts = document.getElementById('sales-ratio-appointments');
  if (sAppts) {
    sAppts.value = state.salesRatios.appointmentToListing;
    sAppts.addEventListener('input', (e) => {
      state.salesRatios.appointmentToListing = Number(e.target.value);
      agentStore.saveToStorage();
    });
  }

  const sListings = document.getElementById('sales-ratio-listings');
  if (sListings) {
    sListings.value = state.salesRatios.listingToClosing;
    sListings.addEventListener('input', (e) => {
      state.salesRatios.listingToClosing = Number(e.target.value);
      agentStore.saveToStorage();
    });
  }

  const rContacts = document.getElementById('rentals-ratio-contacts');
  if (rContacts) {
    rContacts.value = state.rentalRatios.contactsToAppointment;
    rContacts.addEventListener('input', (e) => {
      state.rentalRatios.contactsToAppointment = Number(e.target.value);
      agentStore.saveToStorage();
    });
  }

  const rAppts = document.getElementById('rentals-ratio-appointments');
  if (rAppts) {
    rAppts.value = state.rentalRatios.appointmentToListing;
    rAppts.addEventListener('input', (e) => {
      state.rentalRatios.appointmentToListing = Number(e.target.value);
      agentStore.saveToStorage();
    });
  }

  const rListings = document.getElementById('rentals-ratio-listings');
  if (rListings) {
    rListings.value = state.rentalRatios.listingToClosing;
    rListings.addEventListener('input', (e) => {
      state.rentalRatios.listingToClosing = Number(e.target.value);
      agentStore.saveToStorage();
    });
  }
}

/* ==========================================================================
   7. PASO 5: RESULTADOS Y PLANES CONSOLIDADOS DUALES
   ========================================================================== */
function renderStep5Results() {
  const calc = agentStore.getCalculations();
  const state = agentStore.getState();
  const container = document.getElementById('final-results-container');

  if (!container) return;

  const floor = calc.floorPlan;
  const full = calc.fullPlan;
  const maxCap = formatCOP(calc.maxMarketCenterCap);

  container.innerHTML = `
    <!-- BANNER INFORMATIVO -->
    <div class="mrea-info-banner mb-4">
      <div class="info-icon">📊</div>
      <div class="info-text">
        <strong>Comparativo de Planes MREA:</strong> A continuación se muestran los <strong>2 Planes de Acción Consolidados</strong>: El <strong>Plan de Piso Mínimo</strong> (supervivencia básica) y el <strong>Plan Completo de Sueños</strong> (metas personales + negocio + costos).
      </div>
    </div>

    <!-- COMPARATIVO DE PLAN A VS PLAN B -->
    <div class="dual-config-grid mb-4">
      
      <!-- PLAN A: PISO MÍNIMO DE SUPERVIVENCIA -->
      <div class="config-card sales-border" style="border-left-width: 6px;">
        <div class="card-title-row">
          <span class="icon">🛡️</span>
          <div>
            <h3 class="text-kw">PLAN A: PISO MÍNIMO DE SUPERVIVENCIA</h3>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Solo Gastos No Negociables + Gastos Operación + Impuestos + Costos Ventas</p>
          </div>
        </div>

        <div class="budget-totals-grid" style="grid-template-columns: 1fr; gap: 0.75rem; margin: 1rem 0;">
          <div class="total-card highlight-card">
            <span class="card-title">GCI Requerido (Piso Mínimo)</span>
            <span class="card-amount text-kw">${formatCOP(floor.gciNeededMonthly)} / mes</span>
            <span class="card-sub">${formatCOP(floor.gciNeededYearly)} / año</span>
          </div>

          <div class="total-card">
            <span class="card-title">Cierres Totales Requeridos</span>
            <span class="card-amount text-main">${floor.totalDealsYearly} cierres / año</span>
            <span class="card-sub">(${floor.salesDealsYearly} Ventas + ${floor.rentalDealsYearly} Arriendos)</span>
          </div>

          <div class="total-card">
            <span class="card-title">Captaciones / Exclusivas Requeridas</span>
            <span class="card-amount text-amber">${floor.totalListingsYearly} captaciones / año</span>
            <span class="card-sub">~ ${floor.totalListingsMonthly} captaciones al mes</span>
          </div>

          <div class="total-card">
            <span class="card-title">CITAS SEMANALES MÍNIMAS</span>
            <span class="card-amount text-blue">${floor.totalAppointmentsWeekly} citas / semana</span>
            <span class="card-sub">(${floor.salesAppointmentsWeekly} Ventas + ${floor.rentalAppointmentsWeekly} Arriendos)</span>
          </div>

          <div class="total-card">
            <span class="card-title">LLAMADAS / CONTACTOS SEMANALES MÍNIMOS</span>
            <span class="card-amount text-emerald">${floor.totalContactsWeekly} llamadas / semana</span>
            <span class="card-sub">(${floor.salesContactsWeekly} Ventas + ${floor.rentalContactsWeekly} Arriendos)</span>
          </div>
        </div>
      </div>

      <!-- PLAN B: PLAN COMPLETO DE SUEÑOS & METAS -->
      <div class="config-card rentals-border" style="border-left-width: 6px; border-left-color: var(--emerald);">
        <div class="card-title-row">
          <span class="icon">🚀</span>
          <div>
            <h3 class="text-emerald">PLAN B: PLAN COMPLETO DE SUEÑOS & METAS</h3>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Gastos No Negociables + Negociables (Sueños) + Operación + Impuestos + Costos Ventas</p>
          </div>
        </div>

        <div class="budget-totals-grid" style="grid-template-columns: 1fr; gap: 0.75rem; margin: 1rem 0;">
          <div class="total-card" style="background: rgba(5, 150, 105, 0.1); border-color: rgba(5, 150, 105, 0.3);">
            <span class="card-title">GCI Requerido (Plan Completo)</span>
            <span class="card-amount text-emerald">${formatCOP(full.gciNeededMonthly)} / mes</span>
            <span class="card-sub">${formatCOP(full.gciNeededYearly)} / año</span>
          </div>

          <div class="total-card">
            <span class="card-title">Cierres Totales Requeridos</span>
            <span class="card-amount text-main">${full.totalDealsYearly} cierres / año</span>
            <span class="card-sub">(${full.salesDealsYearly} Ventas + ${full.rentalDealsYearly} Arriendos)</span>
          </div>

          <div class="total-card">
            <span class="card-title">Captaciones / Exclusivas Requeridas</span>
            <span class="card-amount text-amber">${full.totalListingsYearly} captaciones / año</span>
            <span class="card-sub">~ ${full.totalListingsMonthly} captaciones al mes</span>
          </div>

          <div class="total-card">
            <span class="card-title">CITAS SEMANALES REQUERIDAS</span>
            <span class="card-amount text-blue">${full.totalAppointmentsWeekly} citas / semana</span>
            <span class="card-sub">(${full.salesAppointmentsWeekly} Ventas + ${full.rentalAppointmentsWeekly} Arriendos)</span>
          </div>

          <div class="total-card">
            <span class="card-title">LLAMADAS / CONTACTOS SEMANALES REQUERIDOS</span>
            <span class="card-amount text-emerald">${full.totalContactsWeekly} llamadas / semana</span>
            <span class="card-sub">(${full.salesContactsWeekly} Ventas + ${full.rentalContactsWeekly} Arriendos)</span>
          </div>
        </div>
      </div>

    </div>

    <!-- DESGLOSE DETALLADO DE ACTIVIDAD DEL PLAN COMPLETO -->
    <div class="consolidated-card">
      <h3>⭐ DESGLOSE DETALLADO DE ACTIVIDAD (PLAN COMPLETO DE SUEÑOS)</h3>
      <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.25rem;">
        Distribución semanal y mensual según tu mezcla de negocio (${state.businessMix.salesPercent}% Ventas / ${state.businessMix.rentalsPercent}% Arriendos) y Split del ${state.agentSplitPercent}%.
      </p>

      <div class="section-title-row" style="margin-top: 1rem;">
        <span>🏷️</span>
        <h3>Actividad Requerida para VENTAS</h3>
      </div>
      <div class="budget-totals-grid">
        <div class="total-card sales-border">
          <span class="card-title">Ventas Cerradas</span>
          <span class="card-amount text-kw">${full.salesDealsYearly} ventas / año</span>
          <span class="card-sub">~ ${full.salesDealsMonthly} ventas al mes</span>
        </div>
        <div class="total-card">
          <span class="card-title">Captaciones de Venta</span>
          <span class="card-amount text-amber">${full.salesListingsYearly} captaciones / año</span>
          <span class="card-sub">~ ${full.salesListingsMonthly} captaciones al mes</span>
        </div>
        <div class="total-card">
          <span class="card-title">Citas de Venta</span>
          <span class="card-amount text-blue">${full.salesAppointmentsWeekly} citas / semana</span>
        </div>
        <div class="total-card">
          <span class="card-title">Llamadas de Venta</span>
          <span class="card-amount text-emerald">${full.salesContactsWeekly} llamadas / semana</span>
        </div>
      </div>

      <div class="section-title-row" style="margin-top: 1rem;">
        <span>🔑</span>
        <h3>Actividad Requerida para ARRIENDOS</h3>
      </div>
      <div class="budget-totals-grid">
        <div class="total-card rentals-border">
          <span class="card-title">Arriendos Cerrados</span>
          <span class="card-amount text-blue">${full.rentalDealsYearly} arriendos / año</span>
          <span class="card-sub">~ ${full.rentalDealsMonthly} arriendos al mes</span>
        </div>
        <div class="total-card">
          <span class="card-title">Captaciones de Arriendo</span>
          <span class="card-amount text-amber">${full.rentalListingsYearly} captaciones / año</span>
          <span class="card-sub">~ ${full.rentalListingsMonthly} captaciones al mes</span>
        </div>
        <div class="total-card">
          <span class="card-title">Citas de Arriendo</span>
          <span class="card-amount text-blue">${full.rentalAppointmentsWeekly} citas / semana</span>
        </div>
        <div class="total-card">
          <span class="card-title">Llamadas de Arriendo</span>
          <span class="card-amount text-emerald">${full.rentalContactsWeekly} llamadas / semana</span>
        </div>
      </div>

    </div>
  `;
}
