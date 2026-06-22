## ADDED Requirements

### Requirement: Insights Dashboard Page

The system SHALL provide a sales insights dashboard at `dashboard/reports/insights` with multi-chart visualizations, KPI cards, and data tables.

#### Scenario: Renders insights dashboard

- **WHEN** a user with appropriate permissions navigates to `/dashboard/reports/insights`
- **THEN** the system SHALL display: a date range filter panel, KPI summary cards, chart.js visualizations (daily sales line chart, category distribution doughnut, top products bar chart), and supporting data tables

#### Scenario: KPI cards show key metrics

- **WHEN** the page loads
- **THEN** the system SHALL display summary cards for total revenue, total transactions, total products sold, average transaction value, and unique customer count

#### Scenario: Daily sales line chart

- **WHEN** the page loads with data
- **THEN** the system SHALL render a line chart (chart.js) showing daily sales over the selected period

#### Scenario: Category distribution doughnut chart

- **WHEN** the page loads with data
- **THEN** the system SHALL render a doughnut chart showing revenue distribution by product category

#### Scenario: Top products bar chart

- **WHEN** the page loads with data
- **THEN** the system SHALL render a horizontal bar chart showing top-selling products by quantity or revenue

#### Scenario: Product coverage analysis

- **WHEN** the page loads
- **THEN** the system SHALL display a product coverage table showing each product's stock status, sales velocity, and movement classification (Kritis, Rendah, Sehat, Tidak Bergerak)

#### Scenario: Promo/pricing analysis

- **WHEN** the page loads
- **THEN** the system SHALL display active and scheduled promotions with their status badges (Aktif, Terjadwal, Berakhir, Nonaktif)

#### Scenario: Filters update all charts

- **WHEN** the user changes date range, cashier, customer, or category filters and applies
- **THEN** the system SHALL reload all charts and summary data to reflect the filtered period

#### Scenario: Charts are properly cleaned up

- **WHEN** the user navigates away from the insights page
- **THEN** the system SHALL destroy all chart.js instances to prevent memory leaks

#### Scenario: Low data state

- **WHEN** there is no transaction data for the selected period
- **THEN** the system SHALL display empty state indicators instead of charts
