import { Demo1LightSidebarPage } from '@/pages/dashboards';
import { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { AuthPage } from '@/auth';
import { RequireAuth } from '@/auth/RequireAuth';
import { ErrorsRouting } from '@/errors';
import { Demo1Layout } from '@/layouts/demo1';
import { ConnectedAccountsPage } from '@/pages/connected-accounts/ConnectedAccount';
import ExpressDashboardAccess from '@/pages/stripe-express/dashboard/ExpressDashboardAccess';
import ExpressDashboardConfig from '@/pages/stripe-express/dashboard/ExpressDashboardConfig';
import ExpressOnboarding from '@/pages/stripe-express/onboarding/ExpressOnboarding';
import StandardDashboardAccess from '@/pages/stripe-standard/dashboard/StandardDashboardAccess';
import { StandardOnboarding } from '@/pages/stripe-standard/standard-onboarding/StandardOnboarding';
import OnboardingComplete from '@/pages/stripe-express/onboarding/OnboardingComplete';
import StandardOnboardingComplete from '@/pages/stripe-standard/standard-onboarding/StandardOnboardingComplete';

const AppRoutingSetup = (): ReactElement => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route element={<Demo1Layout />}>
          <Route path="/" element={<Demo1LightSidebarPage />} />
          {/* Stripe Express */}
          <Route path="/stripe-express/onboarding" element={<ExpressOnboarding />} />
          <Route path="/stripe-express/dashboard/access" element={<ExpressDashboardAccess />} />
          <Route path="/stripe-express/onboarding/complete" element={<OnboardingComplete />} />
          <Route path="/stripe-express/dashboard/config" element={<ExpressDashboardConfig />} />
          {/* Stripe Standard */}
          <Route path="/stripe-standard/onboarding" element={<StandardOnboarding />} />
          <Route path="/stripe-standard/dashboard/access" element={<StandardDashboardAccess />} />
          <Route
            path="/stripe-standard/onboarding/complete"
            element={<StandardOnboardingComplete />}
          />
          <Route path="/stripe-standard/dashboard/config" element={<ExpressDashboardConfig />} />
          {/* Connected Accounts */}
          <Route path="/connected-accounts" element={<ConnectedAccountsPage />} />
          {/* <Route path="/dark-sidebar" element={<Demo1DarkSidebarPage />} />
          <Route path="/public-profile/profiles/default" element={<ProfileDefaultPage />} />
          <Route path="/public-profile/profiles/creator" element={<ProfileCreatorPage />} />
          <Route path="/public-profile/profiles/company" element={<ProfileCompanyPage />} />
          <Route path="/public-profile/profiles/nft" element={<ProfileNFTPage />} />
          <Route path="/public-profile/profiles/blogger" element={<ProfileBloggerPage />} />
          <Route path="/public-profile/profiles/crm" element={<ProfileCRMPage />} />
          <Route path="/public-profile/profiles/gamer" element={<ProfileGamerPage />} />
          <Route path="/public-profile/profiles/feeds" element={<ProfileFeedsPage />} />
          <Route path="/public-profile/profiles/plain" element={<ProfilePlainPage />} />
          <Route path="/public-profile/profiles/modal" element={<ProfileModalPage />} />
          <Route path="/public-profile/projects/3-columns" element={<ProjectColumn3Page />} />
          <Route path="/public-profile/projects/2-columns" element={<ProjectColumn2Page />} />
          <Route path="/public-profile/works" element={<ProfileWorksPage />} />
          <Route path="/public-profile/teams" element={<ProfileTeamsPage />} />
          <Route path="/public-profile/network" element={<ProfileNetworkPage />} />
          <Route path="/public-profile/activity" element={<ProfileActivityPage />} />
          <Route path="/public-profile/campaigns/card" element={<CampaignsCardPage />} />
          <Route path="/public-profile/campaigns/list" element={<CampaignsListPage />} />
          <Route path="/public-profile/empty" element={<ProfileEmptyPage />} />
          <Route path="/account/home/get-started" element={<AccountGetStartedPage />} />
          <Route path="/account/home/user-profile" element={<AccountUserProfilePage />} />
          <Route path="/account/home/company-profile" element={<AccountCompanyProfilePage />} />
          <Route path="/account/home/settings-sidebar" element={<AccountSettingsSidebarPage />} />
          <Route
            path="/account/home/settings-enterprise"
            element={<AccountSettingsEnterprisePage />}
          />
          <Route path="/account/home/settings-plain" element={<AccountSettingsPlainPage />} />
          <Route path="/account/home/settings-modal" element={<AccountSettingsModalPage />} />
          <Route path="/account/billing/basic" element={<AccountBasicPage />} />
          <Route path="/account/billing/enterprise" element={<AccountEnterprisePage />} />
          <Route path="/account/billing/plans" element={<AccountPlansPage />} />
          <Route path="/account/billing/history" element={<AccountHistoryPage />} />
          <Route path="/account/security/get-started" element={<AccountSecurityGetStartedPage />} />
          <Route path="/account/security/overview" element={<AccountOverviewPage />} />
          <Route
            path="/account/security/allowed-ip-addresses"
            element={<AccountAllowedIPAddressesPage />}
          />
          <Route
            path="/account/security/privacy-settings"
            element={<AccountPrivacySettingsPage />}
          />
          <Route
            path="/account/security/device-management"
            element={<AccountDeviceManagementPage />}
          />
          <Route
            path="/account/security/backup-and-recovery"
            element={<AccountBackupAndRecoveryPage />}
          />
          <Route
            path="/account/security/current-sessions"
            element={<AccountCurrentSessionsPage />}
          />
          <Route path="/account/security/security-log" element={<AccountSecurityLogPage />} />
          <Route path="/account/members/team-starter" element={<AccountTeamsStarterPage />} />
          <Route path="/account/members/teams" element={<AccountTeamsPage />} />
          <Route path="/account/members/team-info" element={<AccountTeamInfoPage />} />
          <Route path="/account/members/members-starter" element={<AccountMembersStarterPage />} />
          <Route path="/account/members/team-members" element={<AccountTeamMembersPage />} />
          <Route path="/account/members/import-members" element={<AccountImportMembersPage />} />
          <Route path="/account/members/roles" element={<AccountRolesPage />} />
          <Route
            path="/account/members/permissions-toggle"
            element={<AccountPermissionsTogglePage />}
          />
          <Route
            path="/account/members/permissions-check"
            element={<AccountPermissionsCheckPage />}
          />
          <Route path="/account/integrations" element={<AccountIntegrationsPage />} />
          <Route path="/account/notifications" element={<AccountNotificationsPage />} />
          <Route path="/account/api-keys" element={<AccountApiKeysPage />} />
          <Route path="/account/appearance" element={<AccountAppearancePage />} />
          <Route path="/account/invite-a-friend" element={<AccountInviteAFriendPage />} />
          <Route path="/account/activity" element={<AccountActivityPage />} />
          <Route path="/network/get-started" element={<NetworkGetStartedPage />} />
          <Route path="/network/user-cards/mini-cards" element={<NetworkMiniCardsPage />} />
          <Route path="/network/user-cards/team-crew" element={<NetworkUserCardsTeamCrewPage />} />
          <Route path="/network/user-cards/author" element={<NetworkAuthorPage />} />
          <Route path="/network/user-cards/nft" element={<NetworkNFTPage />} />
          <Route path="/network/user-cards/social" element={<NetworkSocialPage />} />
          <Route path="/network/user-table/team-crew" element={<NetworkUserTableTeamCrewPage />} />
          <Route path="/network/user-table/app-roster" element={<NetworkAppRosterPage />} />
          <Route path="/network/user-table/market-authors" element={<NetworkMarketAuthorsPage />} />
          <Route path="/network/user-table/saas-users" element={<NetworkSaasUsersPage />} />
          <Route path="/network/user-table/store-clients" element={<NetworkStoreClientsPage />} />
          <Route path="/network/user-table/visitors" element={<NetworkVisitorsPage />} />
          <Route path="/auth/welcome-message" element={<AuthenticationWelcomeMessagePage />} />
          <Route
            path="/auth/account-deactivated"
            element={<AuthenticationAccountDeactivatedPage />}
          />
          <Route path="/authentication/get-started" element={<AuthenticationGetStartedPage />} /> */}
        </Route>
      </Route>
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRoutingSetup };
