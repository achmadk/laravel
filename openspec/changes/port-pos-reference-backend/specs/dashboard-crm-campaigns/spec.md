## ADDED Requirements

### Requirement: CRM Campaign management

The dashboard SHALL include CRM Campaign pages for creating, editing, viewing, and processing marketing campaigns.

#### Scenario: Campaign index renders

- **WHEN** a user with `crm-campaigns-access` visits `/dashboard/crm-campaigns`
- **THEN** they SHALL see a list of campaigns with status filters

#### Scenario: Campaign create/edit

- **WHEN** a user with `crm-campaigns-create` visits the create page
- **THEN** they SHALL see a form with campaign type, target, message, and schedule fields

#### Scenario: Campaign show/detail

- **WHEN** a user clicks on a campaign
- **THEN** they SHALL see campaign details and delivery logs
