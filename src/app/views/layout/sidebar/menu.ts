import {MenuItem} from './menu.model';

/*export const MENU: MenuItem[] = [
  {
    label: 'Main',
    isTitle: true
  },
  {
    label: 'Dashboard',
    icon: 'home',
    link: '/dashboard'
  },
  {
    label: 'Sample',
    link: '/sample'
  },
  {
    label: 'Masters',
    isTitle: true
  },
  {
    label: 'Masters',
    icon: 'edit-2',
    subItems: [
      {
        label: 'Role',
        link: '/apps/email/inbox',
      },
      {
        label: 'User',
        link: '/apps/email/read'
      },
      {
        label: 'Bank Master',
        link: '/apps/email/compose'
      },
    ]
  },
  {
    label: 'Merchants',
    isTitle: true
  },
  {
    label: 'Merchants',
    icon: 'user-plus',
    subItems: [
      {
        label: 'Merchant Master',
        link: '/merchants/reseller-master',
      },
      {
        label: 'Bulk MDR',
        link: '/accounts/accountlist'
      },
    ]
  },
  {
    label: 'Refund',
    isTitle: true
  },
  {
    label: 'Refund',
    icon: 'box',
    subItems: [
      {
        label: 'Refund List',
        link: '/apps/email/inbox',
      },
      {
        label: 'Refund Request Status',
        link: '/apps/email/read'
      },
      {
        label: 'Raise Refund Request',
        link: '/apps/email/compose'
      },
    ]
  },
  {
    label: 'Recon ManageMent',
    isTitle: true,
  },
  {
    label: 'Recon ManageMent',
    icon: 'grid',
    subItems: [
      {
        label: 'Recon Config',
        link: '/apps/email/inbox',
      },
      {
        label: 'Upload Recon File',
        link: '/apps/email/read'
      },
      {
        label: 'Recon Exception',
        link: '/apps/email/compose'
      },
      {
        label: 'Recon Reports',
        link: '/apps/email/compose'
      },
    ]
  },
  {
    label: 'Payout & Settlement',
    isTitle: true,

  },
  {
    label: 'Payout & Settlement',
    icon: 'edit',
    subItems: [
      {
        label: 'Generate Payout',
        link: '/apps/email/inbox',
      },
      {
        label: 'Settlement File',
        link: '/apps/email/read'
      },
      {
        label: 'Bank Account Details',
        link: '/apps/email/compose'
      },
      {
        label: 'Bank Claim',
        link: '/apps/email/compose'
      },
    ]
  },
];*/

export const MENU: MenuItem[] = [
  {
    label: 'Masters',
    isTitle: true
  },
  {
    label: 'Masters',
    icon: 'edit-2',
    subItems: [
      {
        label: 'Merchant Master',
        link: '/merchants/reseller-master',
      }
    ]
  },
  {
    label: 'Masters',
    icon: 'edit-2',
    subItems: [
      {
        label: 'Merchant Configuration',
        link: '/riskconfig/merchantconfig',
      },
      {
        label: 'Global Configuration',
        link: '/riskconfig/globalconfig',
      }
    ]
  }

];
