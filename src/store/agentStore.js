/**
 * 🎓 APRENDE A PROGRAMAR - ALMACÉN DE DATOS DEL AGENTE (agentStore.js)
 * 
 * Modelo Económico MREA de Keller Williams con DOBLE PLAN EN EL PASO 5:
 * 1. Plan de Piso Mínimo de Supervivencia (Solo No Negociables + Operación + Impuestos + Costo Ventas)
 * 2. Plan Completo de Sueños (No Negociables + Negociables + Operación + Impuestos + Costo Ventas)
 */

const STORAGE_KEY = 'kw_agente_modelo_economico_v10';

const defaultState = {
  agentId: 'agente-demo-01',
  agentName: 'Agente KW Santa Ana',
  agentEmail: 'agente@kellerwilliams.com',
  role: 'agente',
  
  monthsRemainingInYear: 12,

  entryMonth: 'marzo',
  anniversaryStartMonth: 'abril',

  netIncome: {
    monthly: 0,
    yearly: 0
  },

  nonNegotiableExpenses: [
    { id: 'nn_housing', name: 'Arriendo / Crédito Hipotecario', monthly: 0 },
    { id: 'nn_admin', name: 'Administración Vivienda', monthly: 0 },
    { id: 'nn_utilities', name: 'Servicios Públicos', monthly: 0 },
    { id: 'nn_health', name: 'Salud', monthly: 0 },
    { id: 'nn_social_benefits', name: 'Prestaciones Sociales', monthly: 0 },
    { id: 'nn_groceries', name: 'Mercado', monthly: 0 },
    { id: 'nn_restaurants', name: 'Restaurantes', monthly: 0 },
    { id: 'nn_transport', name: 'Transporte', monthly: 0 },
    { id: 'nn_gasoline', name: 'Gasolina', monthly: 0 },
    { id: 'nn_credit_cards', name: 'Deudas Tarjetas de Crédito', monthly: 0 },
    { id: 'nn_bank_loans', name: 'Deudas Créditos Bancarios', monthly: 0 },
    { id: 'nn_other_debts', name: 'Deudas Otros', monthly: 0 },
    { id: 'nn_leisure', name: 'Ocio', monthly: 0 },
    { id: 'nn_sports', name: 'Deporte', monthly: 0 },
    { id: 'nn_contribution', name: 'Contribución', monthly: 0 },
    { id: 'nn_school', name: 'Colegio', monthly: 0 },
    { id: 'nn_university', name: 'Universidad', monthly: 0 },
    { id: 'nn_salaries', name: 'Salarios / Honorarios', monthly: 0 },
    { id: 'nn_insurance', name: 'Seguros', monthly: 0 },
    { id: 'nn_personal_taxes', name: 'Impuestos Personales', monthly: 0 },
    { id: 'nn_misc', name: 'Varios', monthly: 0 }
  ],

  negotiableExpenses: [
    { id: 'neg_travel', name: 'Viajes', monthly: 0 },
    { id: 'neg_education', name: 'Educación', monthly: 0 },
    { id: 'neg_vehicle', name: 'Compra / Cambio Vehículo', monthly: 0 },
    { id: 'neg_housing_upgrade', name: 'Compra / Cambio Vivienda', monthly: 0 },
    { id: 'neg_investments', name: 'Inversiones', monthly: 0 },
    { id: 'neg_donations', name: 'Donaciones / Contribución', monthly: 0 }
  ],

  kwCostOfSales: {
    marketCenterCapPercent: 30,
    maxMarketCenterCap: 28000000,
    kwRoyaltiesPercent: 8,
    growthTreePercent: 2
  },

  businessTaxesPercent: 11,

  businessExpenses: [
    { id: 'b_kw_monthly', name: 'Mensualidad KW', monthly: 270000 },
    { id: 'b_kw_annual', name: 'Anualidad KW', monthly: 38750 },
    { id: 'b_coaching', name: 'Coaching', monthly: 0 },
    { id: 'b_phone', name: 'Teléfono', monthly: 35000 },
    { id: 'b_marketing', name: 'Publicidad & Mercadeo', monthly: 0 },
    { id: 'b_portals', name: 'Portales Inmobiliarios', monthly: 0 },
    { id: 'b_salaries', name: 'Salarios / Honorarios', monthly: 0 },
    { id: 'b_leads', name: 'Generación de Contactos', monthly: 0 },
    { id: 'b_education', name: 'Educación', monthly: 0 },
    { id: 'b_transport', name: 'Transporte Negocios', monthly: 200000 },
    { id: 'b_supplies', name: 'Suministros', monthly: 150000 },
    { id: 'b_equipment', name: 'Infraestructura / Equipos', monthly: 50000 },
    { id: 'b_office_rent', name: 'Arriendo Oficina', monthly: 0 }
  ],

  taxRatePercent: 11,
  workWeeksYear: 48,
  agentSplitPercent: 70,

  businessMix: {
    salesPercent: 70,
    rentalsPercent: 30
  },

  salesMetrics: {
    averagePropertyPrice: 350000000,
    commissionPercent: 3
  },

  rentalMetrics: {
    averageMonthlyRent: 2500000,
    commissionType: 'months',
    commissionMonths: 1,
    commissionPercent: 8
  },

  salesRatios: {
    contactsToAppointment: 20,
    appointmentToListing: 3,
    listingToClosing: 2
  },

  rentalRatios: {
    contactsToAppointment: 10,
    appointmentToListing: 2,
    listingToClosing: 1.5
  }
};

const MONTHS_LIST = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

class AgentStore {
  constructor() {
    this.state = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          netIncome: { ...defaultState.netIncome, ...(parsed.netIncome || {}) },
          kwCostOfSales: { ...defaultState.kwCostOfSales, ...(parsed.kwCostOfSales || {}) },
          businessMix: { ...defaultState.businessMix, ...(parsed.businessMix || {}) },
          salesMetrics: { ...defaultState.salesMetrics, ...(parsed.salesMetrics || {}) },
          rentalMetrics: { ...defaultState.rentalMetrics, ...(parsed.rentalMetrics || {}) },
          salesRatios: { ...defaultState.salesRatios, ...(parsed.salesRatios || {}) },
          rentalRatios: { ...defaultState.rentalRatios, ...(parsed.rentalRatios || {}) }
        };
      }
    } catch (e) {
      console.warn('No se pudo cargar localStorage v10', e);
    }
    return { ...defaultState };
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error al guardar en localStorage', e);
    }
  }

  getState() {
    return this.state;
  }

  setEntryMonth(monthName) {
    const cleanMonth = String(monthName).toLowerCase();
    this.state.entryMonth = cleanMonth;
    
    const idx = MONTHS_LIST.indexOf(cleanMonth);
    const nextIdx = (idx + 1) % 12;
    this.state.anniversaryStartMonth = MONTHS_LIST[nextIdx];
    
    this.saveToStorage();
  }

  setMaxMarketCenterCap(amount) {
    this.state.kwCostOfSales.maxMarketCenterCap = Number(amount) || 0;
    this.saveToStorage();
  }

  setMonthsRemaining(months) {
    this.state.monthsRemainingInYear = Number(months) || 12;
    this.saveToStorage();
  }

  setNetIncomeMonthly(monthlyAmount) {
    this.state.netIncome.monthly = Number(monthlyAmount) || 0;
    this.state.netIncome.yearly = this.state.netIncome.monthly * (this.state.monthsRemainingInYear || 12);
    this.saveToStorage();
  }

  setNetIncomeYearly(yearlyAmount) {
    this.state.netIncome.yearly = Number(yearlyAmount) || 0;
    this.state.netIncome.monthly = Math.round(this.state.netIncome.yearly / (this.state.monthsRemainingInYear || 12));
    this.saveToStorage();
  }

  updateExpense(category, id, amount) {
    let list;
    if (category === 'non_negotiable') list = this.state.nonNegotiableExpenses;
    else if (category === 'negotiable') list = this.state.negotiableExpenses;
    else list = this.state.businessExpenses;

    const item = list.find(x => x.id === id);
    if (item) {
      item.monthly = Number(amount) || 0;
      this.saveToStorage();
    }
  }

  addCustomExpense(category, name, amount) {
    let list;
    if (category === 'non_negotiable') list = this.state.nonNegotiableExpenses;
    else if (category === 'negotiable') list = this.state.negotiableExpenses;
    else list = this.state.businessExpenses;

    const newId = `${category}_custom_${Date.now()}`;
    list.push({
      id: newId,
      name: name || 'Nuevo Gasto',
      monthly: Number(amount) || 0
    });
    this.saveToStorage();
    return newId;
  }

  removeExpense(category, id) {
    if (category === 'non_negotiable') {
      this.state.nonNegotiableExpenses = this.state.nonNegotiableExpenses.filter(x => x.id !== id);
    } else if (category === 'negotiable') {
      this.state.negotiableExpenses = this.state.negotiableExpenses.filter(x => x.id !== id);
    } else {
      this.state.businessExpenses = this.state.businessExpenses.filter(x => x.id !== id);
    }
    this.saveToStorage();
  }

  setBusinessTaxesPercent(percent) {
    this.state.businessTaxesPercent = Number(percent) || 0;
    this.state.taxRatePercent = this.state.businessTaxesPercent;
    this.saveToStorage();
  }

  setAgentSplitPercent(percent) {
    this.state.agentSplitPercent = Number(percent) || 0;
    this.saveToStorage();
  }

  setWorkWeeksYear(weeks) {
    this.state.workWeeksYear = Number(weeks) || 48;
    this.saveToStorage();
  }

  setBusinessMixSales(salesPercent) {
    const sales = Math.min(100, Math.max(0, Number(salesPercent) || 0));
    this.state.businessMix.salesPercent = sales;
    this.state.businessMix.rentalsPercent = 100 - sales;
    this.saveToStorage();
  }

  /**
   * CÁLCULO DUAL MREA:
   * 1. PLAN DE PISO MÍNIMO (No Negociables + Operación + Impuestos + Costo Ventas)
   * 2. PLAN COMPLETO DE SUEÑOS (No Negociables + Negociables + Operación + Impuestos + Costo Ventas)
   */
  getCalculations() {
    const { netIncome, nonNegotiableExpenses, negotiableExpenses, businessExpenses, monthsRemainingInYear, kwCostOfSales, businessTaxesPercent, workWeeksYear, agentSplitPercent, businessMix, salesMetrics, rentalMetrics, salesRatios, rentalRatios } = this.state;

    const months = monthsRemainingInYear || 12;

    // Totales de gastos
    const totalNonNegotiableMonthly = nonNegotiableExpenses.reduce((sum, x) => sum + (x.monthly || 0), 0);
    const totalNonNegotiableYearly = totalNonNegotiableMonthly * months;

    const totalNegotiableMonthly = negotiableExpenses.reduce((sum, x) => sum + (x.monthly || 0), 0);
    const totalNegotiableYearly = totalNegotiableMonthly * months;

    // CORRECCIÓN HALLAZGO #1: Suma de No Negociables + Negociables
    const totalPersonalMonthly = totalNonNegotiableMonthly + totalNegotiableMonthly;
    const totalPersonalYearly = totalPersonalMonthly * months;

    const totalBusinessMonthly = businessExpenses.reduce((sum, x) => sum + (x.monthly || 0), 0);
    const totalBusinessYearly = totalBusinessMonthly * months;

    const maxCap = kwCostOfSales.maxMarketCenterCap || 28000000;
    const taxRate = businessTaxesPercent || 11;
    const taxFactor = (100 - taxRate) / 100;
    const weeks = workWeeksYear || 48;

    // Datos de comisión y split
    const salesPrice = salesMetrics.averagePropertyPrice || 0;
    const salesCommPct = salesMetrics.commissionPercent || 0;
    const splitPct = agentSplitPercent || 0;
    const grossCommSalesPerDeal = salesPrice * (salesCommPct / 100);
    const netCommSalesPerDealToAgent = grossCommSalesPerDeal * (splitPct / 100);

    const rentalRent = rentalMetrics.averageMonthlyRent || 0;
    const rentalMonths = rentalMetrics.commissionMonths || 1;
    let grossCommRentalPerDeal = 0;
    if (rentalMetrics.commissionType === 'months') {
      grossCommRentalPerDeal = rentalRent * rentalMonths;
    } else {
      grossCommRentalPerDeal = (rentalRent * 12) * ((rentalMetrics.commissionPercent || 0) / 100);
    }
    const netCommRentalPerDealToAgent = grossCommRentalPerDeal * (splitPct / 100);

    // Helper para calcular GCI Requerido dado un valor de ganancia neta deseada
    const calculateGciForTargetNet = (targetNetYearly) => {
      const netPlusBusinessBeforeTaxes = taxFactor > 0 ? Math.round((targetNetYearly + totalBusinessYearly) / taxFactor) : (targetNetYearly + totalBusinessYearly);
      const uncappedCapGciThreshold = maxCap / 0.30;
      const ongoingCostOfSalesPct = 0.10;

      let gciNeeded = 0;
      let actualMarketCenterCap = 0;

      if (netPlusBusinessBeforeTaxes / 0.60 <= uncappedCapGciThreshold) {
        gciNeeded = Math.round(netPlusBusinessBeforeTaxes / 0.60);
        actualMarketCenterCap = Math.round(gciNeeded * 0.30);
      } else {
        gciNeeded = Math.round((netPlusBusinessBeforeTaxes + maxCap) / (1 - ongoingCostOfSalesPct));
        actualMarketCenterCap = maxCap;
      }

      const gciMonthly = Math.round(gciNeeded / months);
      const gciSales = gciNeeded * ((businessMix.salesPercent || 0) / 100);
      const gciRentals = gciNeeded * ((businessMix.rentalsPercent || 0) / 100);

      // Ventas
      const sDealsYearly = netCommSalesPerDealToAgent > 0 ? (gciSales / netCommSalesPerDealToAgent) : 0;
      const sDealsMonthly = sDealsYearly / months;
      const sListingsYearly = sDealsYearly * (salesRatios.listingToClosing || 1);
      const sListingsMonthly = sListingsYearly / months;
      const sApptsYearly = sListingsYearly * (salesRatios.appointmentToListing || 1);
      const sApptsWeekly = sApptsYearly / weeks;
      const sContactsYearly = sApptsYearly * (salesRatios.contactsToAppointment || 1);
      const sContactsWeekly = sContactsYearly / weeks;

      // Arriendos
      const rDealsYearly = netCommRentalPerDealToAgent > 0 ? (gciRentals / netCommRentalPerDealToAgent) : 0;
      const rDealsMonthly = rDealsYearly / months;
      const rListingsYearly = rDealsYearly * (rentalRatios.listingToClosing || 1);
      const rListingsMonthly = rListingsYearly / months;
      const rApptsYearly = rListingsYearly * (rentalRatios.appointmentToListing || 1);
      const rApptsWeekly = rApptsYearly / weeks;
      const rContactsYearly = rApptsYearly * (rentalRatios.contactsToAppointment || 1);
      const rContactsWeekly = rContactsYearly / weeks;

      // Consolidado
      const totDealsYearly = sDealsYearly + rDealsYearly;
      const totDealsMonthly = totDealsYearly / months;
      const totListingsYearly = sListingsYearly + rListingsYearly;
      const totListingsMonthly = totListingsYearly / months;
      const totApptsWeekly = sApptsWeekly + rApptsWeekly;
      const totContactsWeekly = sContactsWeekly + rContactsWeekly;

      return {
        gciNeededYearly: gciNeeded,
        gciNeededMonthly: gciMonthly,
        actualMarketCenterCap,
        gciSalesYearly: gciSales,
        gciRentalsYearly: gciRentals,

        salesDealsYearly: Math.ceil(sDealsYearly * 10) / 10,
        salesDealsMonthly: Math.ceil(sDealsMonthly * 10) / 10,
        salesListingsYearly: Math.ceil(sListingsYearly * 10) / 10,
        salesListingsMonthly: Math.ceil(sListingsMonthly * 10) / 10,
        salesAppointmentsWeekly: Math.ceil(sApptsWeekly),
        salesContactsWeekly: Math.ceil(sContactsWeekly),

        rentalDealsYearly: Math.ceil(rDealsYearly * 10) / 10,
        rentalDealsMonthly: Math.ceil(rDealsMonthly * 10) / 10,
        rentalListingsYearly: Math.ceil(rListingsYearly * 10) / 10,
        rentalListingsMonthly: Math.ceil(rListingsMonthly * 10) / 10,
        rentalAppointmentsWeekly: Math.ceil(rApptsWeekly),
        rentalContactsWeekly: Math.ceil(rContactsWeekly),

        totalDealsYearly: Math.ceil(totDealsYearly * 10) / 10,
        totalDealsMonthly: Math.ceil(totDealsMonthly * 10) / 10,
        totalListingsYearly: Math.ceil(totListingsYearly * 10) / 10,
        totalListingsMonthly: Math.ceil(totListingsMonthly * 10) / 10,
        totalAppointmentsWeekly: Math.ceil(totApptsWeekly),
        totalContactsWeekly: Math.ceil(totContactsWeekly)
      };
    };

    // 1. PLAN DE PISO MÍNIMO (Solo No Negociables)
    const floorPlan = calculateGciForTargetNet(totalNonNegotiableYearly);

    // 2. PLAN COMPLETO (No Negociables + Negociables / Meta Neta)
    const targetFullNet = netIncome.yearly > 0 ? netIncome.yearly : totalPersonalYearly;
    const fullPlan = calculateGciForTargetNet(targetFullNet);

    return {
      monthsRemainingInYear: months,
      maxMarketCenterCap: maxCap,
      totalNonNegotiableMonthly,
      totalNonNegotiableYearly,
      totalNegotiableMonthly,
      totalNegotiableYearly,
      totalPersonalMonthly,
      totalPersonalYearly,
      totalBusinessMonthly,
      totalBusinessYearly,

      grossCommSalesPerDeal,
      netCommSalesPerDealToAgent,
      grossCommRentalPerDeal,
      netCommRentalPerDealToAgent,

      // PLAN A: PISO MÍNIMO DE SUPERVIVENCIA
      floorPlan,

      // PLAN B: PLAN COMPLETO DE SUEÑOS
      fullPlan,

      // Compatibilidad con tarjetas individuales
      floorGciNeededMonthly: floorPlan.gciNeededMonthly,
      floorGciNeededYearly: floorPlan.gciNeededYearly,
      gciNeededMonthly: fullPlan.gciNeededMonthly,
      gciNeededYearly: fullPlan.gciNeededYearly,
      gciSalesYearly: fullPlan.gciSalesYearly,
      gciRentalsYearly: fullPlan.gciRentalsYearly,

      salesDealsYearly: fullPlan.salesDealsYearly,
      salesDealsMonthly: fullPlan.salesDealsMonthly,
      salesListingsYearly: fullPlan.salesListingsYearly,
      salesListingsMonthly: fullPlan.salesListingsMonthly,
      salesAppointmentsWeekly: fullPlan.salesAppointmentsWeekly,
      salesContactsWeekly: fullPlan.salesContactsWeekly,

      rentalDealsYearly: fullPlan.rentalDealsYearly,
      rentalDealsMonthly: fullPlan.rentalDealsMonthly,
      rentalListingsYearly: fullPlan.rentalListingsYearly,
      rentalListingsMonthly: fullPlan.rentalListingsMonthly,
      rentalAppointmentsWeekly: fullPlan.rentalAppointmentsWeekly,
      rentalContactsWeekly: fullPlan.rentalContactsWeekly,

      totalDealsYearly: fullPlan.totalDealsYearly,
      totalDealsMonthly: fullPlan.totalDealsMonthly,
      totalListingsYearly: fullPlan.totalListingsYearly,
      totalListingsMonthly: fullPlan.totalListingsMonthly,
      totalAppointmentsWeekly: fullPlan.totalAppointmentsWeekly,
      totalContactsWeekly: fullPlan.totalContactsWeekly
    };
  }
}

export const agentStore = new AgentStore();
