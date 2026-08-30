
const fs = require("fs");

let settingsContent = fs.readFileSync("src/app/settings/page.tsx", "utf8");
settingsContent = settingsContent.replace(/budgetly-export\.\\\$\{format\}/, "budgetly-export.${format}");
fs.writeFileSync("src/app/settings/page.tsx", settingsContent);

let homeContent = fs.readFileSync("src/app/(tabs)/page.tsx", "utf8");
homeContent = homeContent.replace(/\/transaction\?id=\\\$\{item\.id\}/g, "/transaction?id=${item.id}");
fs.writeFileSync("src/app/(tabs)/page.tsx", homeContent);

let budgetContent = fs.readFileSync("src/app/(tabs)/budget/page.tsx", "utf8");
budgetContent = budgetContent.replace(/\/budget-edit\?id=\\\$\{item\.id\}/g, "/budget-edit?id=${item.id}");
budgetContent = budgetContent.replace(/\\\$\{Math\.max/g, "${Math.max");
fs.writeFileSync("src/app/(tabs)/budget/page.tsx", budgetContent);

let financeContent = fs.readFileSync("src/app/(tabs)/finance/page.tsx", "utf8");
financeContent = financeContent.replace(/flex flex-row items-center gap-3 px-3\.5 py-3 \\\$\{noBorder/g, "flex flex-row items-center gap-3 px-3.5 py-3 ${noBorder");
fs.writeFileSync("src/app/(tabs)/finance/page.tsx", financeContent);

let transactionsContent = fs.readFileSync("src/app/(tabs)/transactions/page.tsx", "utf8");
transactionsContent = transactionsContent.replace(/\\\$\{item\.title\} \\\$\{categoryName\(item\.categoryId\)\}/g, "`\\${item.title} \\${categoryName(item.categoryId)}`");
fs.writeFileSync("src/app/(tabs)/transactions/page.tsx", transactionsContent);

let budgetEditContent = fs.readFileSync("src/app/budget-edit/page.tsx", "utf8");
budgetEditContent = budgetEditContent.replace(/\\\$\{item\.color\}14/g, "${item.color}14");
fs.writeFileSync("src/app/budget-edit/page.tsx", budgetEditContent);

