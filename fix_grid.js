const fs = require('fs');
let c = fs.readFileSync('src/app/(tabs)/page.tsx', 'utf8');
const i1 = c.indexOf('{/* Add Expense Button */}');
const i2 = c.indexOf('{/* Recent Transactions */}');
const i3 = c.indexOf('{/* Finance Board Strip */}');
const block = c.slice(i1, i2);
c = c.slice(0, i1) + c.slice(i2, i3) + '        </div>\\n\\n        <div className=\
lg:col-span-4
flex
flex-col
gap-0\>\\n\\n      ' + block + c.slice(i3);
c = c.replace('      </div>\\n      \\n    </div>\\n  );', '      </div>\\n        </div>\\n      </div>\\n      \\n    </div>\\n  );');
fs.writeFileSync('src/app/(tabs)/page.tsx', c);

