const fs = require('fs');
const pages = [
  'transaction', 'budget-edit', 'cigarette-tracker', 'finance-manage', 
  'goal', 'income-calendar', 'monthly-limit', 'notifications', 
  'onboarding', 'profile-edit', 'settings'
];
pages.forEach(p => {
  const path = 'src/app/' + p + '/page.tsx';
  if (fs.existsSync(path)) {
    let c = fs.readFileSync(path, 'utf8');
    c = c.replace(/className=\\
flex
flex-col
h-full
w-full
bg-background\\/g, 'className=\flex
flex-col
h-[100dvh]
w-full
max-w-[600px]
mx-auto
bg-background
shadow-sm
lg:border-x\');
    fs.writeFileSync(path, c);
  }
});
