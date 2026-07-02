export const id = "bank-account";
export const titleEn = "Bank Account Simulator";
export const titleFr = "Simulateur de compte bancaire";
export const descriptionEn =
  "Simulate a bank account with deposits, withdrawals, transaction history and balance checks.";
export const descriptionFr =
  "Simulez un compte bancaire avec dépôts, retraits, historique des transactions et vérification du solde.";

export const steps = [
  {
    titleEn: "Step 1 — The Account and Basic Transactions",
    titleFr: "Étape 1 — Le compte et les transactions de base",
    contentEn: `## Step 1 — The Account and Basic Transactions

A bank account has three fundamental operations: **deposit**, **withdraw**, and **check balance**.

\`\`\`
Deposit rules:
  ✓ Amount must be positive
  ✓ Amount must be a number
  ✓ No upper limit

Withdrawal rules:
  ✓ Amount must be positive
  ✓ Cannot withdraw more than the current balance
  ✓ Balance can never go below 0
\`\`\`

\`\`\`python
account = {
    "owner":   "Alice",
    "balance": 1000.00,
    "number":  "ACC-001",
}
\`\`\``,

    contentFr: `## Étape 1 — Le compte et les transactions de base

Un compte bancaire a trois opérations fondamentales : **dépôt**, **retrait**, et **vérification du solde**.

\`\`\`
Règles de dépôt :
  ✓ Le montant doit être positif
  ✓ Pas de limite supérieure

Règles de retrait :
  ✓ Le montant doit être positif
  ✓ Ne peut pas retirer plus que le solde actuel
  ✓ Le solde ne peut jamais descendre en dessous de 0
\`\`\``,

    starterCode: {
      default: `# Step 1: Basic account operations

def create_account(owner, initial_balance=0.0, number="ACC-001"):
    """Create a new bank account dictionary."""
    if initial_balance < 0:
        raise ValueError("Initial balance cannot be negative.")
    return {
        "owner": owner,
        "balance": float(initial_balance),
        "number": number,
    }

def deposit(account, amount):
    """
    Deposit money into the account.
    Returns (success, message, new_balance).
    """
    if not isinstance(amount, (int, float)):
        return False, "Amount must be a number.", account["balance"]
    if amount <= 0:
        return False, "Deposit amount must be positive.", account["balance"]

    account["balance"] += amount
    return True, f"Deposited \${amount:,.2f}.", account["balance"]

def withdraw(account, amount):
    """
    Withdraw money from the account.
    Returns (success, message, new_balance).
    """
    if not isinstance(amount, (int, float)):
        return False, "Amount must be a number.", account["balance"]
    if amount <= 0:
        return False, "Withdrawal amount must be positive.", account["balance"]
    if amount > account["balance"]:
        return False, (
            f"Insufficient funds. "
            f"Balance: \${account['balance']:,.2f}, "
            f"Requested: \${amount:,.2f}."
        ), account["balance"]

    account["balance"] -= amount
    return True, f"Withdrew \${amount:,.2f}.", account["balance"]

def get_balance(account):
    """Return the current balance."""
    return account["balance"]

def show_account(account):
    """Display account summary."""
    print(f"  Account:  {account['number']}")
    print(f"  Owner:    {account['owner']}")
    print(f"  Balance:  \${account['balance']:,.2f}")

# --- Test ---
print("=== Account Creation ===")
acc = create_account("Alice Johnson", initial_balance=1000.00, number="ACC-001")
show_account(acc)

print("\\n=== Deposits ===")
for amount in [500, 250.50, -100, 0, "fifty"]:
    ok, msg, bal = deposit(acc, amount)
    status = "✓" if ok else "✗"
    print(f"  {status} deposit({amount!r:>8}) → {msg} (balance: \${bal:,.2f})")

print("\\n=== Withdrawals ===")
for amount in [200, 100.25, 5000, -50, 0]:
    ok, msg, bal = withdraw(acc, amount)
    status = "✓" if ok else "✗"
    print(f"  {status} withdraw({amount!r:>6}) → {msg} (balance: \${bal:,.2f})")

print("\\n=== Final Balance ===")
show_account(acc)
`,
    },

    expectedOutput: `=== Account Creation ===
  Account:  ACC-001
  Owner:    Alice Johnson
  Balance:  $1,000.00

=== Deposits ===
  ✓ deposit(     500) → Deposited $500.00. (balance: $1,500.00)
  ✓ deposit(  250.5) → Deposited $250.50. (balance: $1,750.50)
  ✗ deposit(    -100) → Deposit amount must be positive. (balance: $1,750.50)
  ✗ deposit(       0) → Deposit amount must be positive. (balance: $1,750.50)
  ✗ deposit( 'fifty') → Amount must be a number. (balance: $1,750.50)

=== Withdrawals ===
  ✓ withdraw(   200) → Withdrew $200.00. (balance: $1,550.50)
  ✓ withdraw(100.25) → Withdrew $100.25. (balance: $1,450.25)
  ✗ withdraw(  5000) → Insufficient funds. Balance: $1,450.25, Requested: $5,000.00. (balance: $1,450.25)
  ✗ withdraw(   -50) → Withdrawal amount must be positive. (balance: $1,450.25)
  ✗ withdraw(     0) → Withdrawal amount must be positive. (balance: $1,450.25)

=== Final Balance ===
  Account:  ACC-001
  Owner:    Alice Johnson
  Balance:  $1,450.25`,
  },

  {
    titleEn: "Step 2 — Transaction History",
    titleFr: "Étape 2 — Historique des transactions",
    contentEn: `## Step 2 — Transaction History

Every real bank keeps a complete record of every transaction. This is called an **audit trail**.

Each transaction record stores:

\`\`\`
{
    "type":    "deposit" or "withdrawal",
    "amount":  the amount,
    "balance": the balance AFTER this transaction,
    "time":    when it happened,
    "note":    optional description
}
\`\`\`

The history enables:
- Monthly statements
- Total deposits vs total withdrawals
- Largest/smallest transactions
- Undo/reverse logic later`,

    contentFr: `## Étape 2 — Historique des transactions

Chaque banque conserve un enregistrement complet de chaque transaction.

Chaque transaction stocke :
\`\`\`
{
    "type":    "dépôt" ou "retrait",
    "montant": le montant,
    "solde":   le solde APRÈS cette transaction,
    "heure":   quand c'est arrivé,
    "note":    description optionnelle
}
\`\`\``,

    starterCode: {
      default: `# Step 2: Transaction history

from datetime import datetime

def create_account(owner, initial_balance=0.0, number="ACC-001"):
    account = {
        "owner": owner,
        "balance": float(initial_balance),
        "number": number,
        "history": [],
    }

    if initial_balance > 0:
        _record(account, "opening", initial_balance, account["balance"], "Account opened")

    return account

def _record(account, txn_type, amount, balance_after, note=""):
    """Add a transaction record to the history."""
    account["history"].append({
        "type": txn_type,
        "amount": round(amount, 2),
        "balance": round(balance_after, 2),
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "note": note,
    })

def deposit(account, amount, note=""):
    if not isinstance(amount, (int, float)) or amount <= 0:
        return False, "Invalid deposit amount.", account["balance"]

    account["balance"] = round(account["balance"] + amount, 2)
    _record(account, "deposit", amount, account["balance"], note)

    return True, f"Deposited \${amount:,.2f}.", account["balance"]

def withdraw(account, amount, note=""):
    if not isinstance(amount, (int, float)) or amount <= 0:
        return False, "Invalid withdrawal amount.", account["balance"]

    if amount > account["balance"]:
        return False, f"Insufficient funds (balance: \${account['balance']:,.2f}).", account["balance"]

    account["balance"] = round(account["balance"] - amount, 2)
    _record(account, "withdrawal", amount, account["balance"], note)

    return True, f"Withdrew \${amount:,.2f}.", account["balance"]

def show_history(account, last_n=None):
    """Display transaction history as a bank statement."""
    history = account["history"]

    if last_n:
        history = history[-last_n:]

    print(f"  {'Date/Time':<22} {'Type':<12} {'Amount':>12} {'Balance':>12} {'Note'}")
    print(f"  {'─'*22} {'─'*12} {'─'*12} {'─'*12} {'─'*20}")

    for txn in history:
        sign = "+" if txn["type"] in ("deposit", "opening") else "-"
        amount = f"{sign}\${txn['amount']:>10,.2f}"
        bal = f"\${txn['balance']:>11,.2f}"

        print(f"  {txn['time']:<22} {txn['type']:<12} {amount} {bal}  {txn['note']}")

def transaction_summary(account):
    """Compute totals from the transaction history."""
    history = account["history"]

    deposits = sum(t["amount"] for t in history if t["type"] == "deposit")
    withdrawals = sum(t["amount"] for t in history if t["type"] == "withdrawal")

    return {
        "total_transactions": len(history),
        "total_deposited": round(deposits, 2),
        "total_withdrawn": round(withdrawals, 2),
        "net_change": round(deposits - withdrawals, 2),
    }

# --- Test ---
acc = create_account("Alice Johnson", 1000.00, "ACC-001")

transactions = [
    ("deposit", 2500.00, "Salary"),
    ("withdraw", 850.00, "Rent"),
    ("withdraw", 120.50, "Groceries"),
    ("deposit", 200.00, "Freelance payment"),
    ("withdraw", 45.99, "Streaming services"),
    ("withdraw", 300.00, "Credit card"),
    ("deposit", 50.00, "Birthday gift"),
    ("withdraw", 89.99, "Phone bill"),
]

print("=== Simulating Transactions ===")
for txn_type, amount, note in transactions:
    if txn_type == "deposit":
        ok, msg, bal = deposit(acc, amount, note)
    else:
        ok, msg, bal = withdraw(acc, amount, note)

    print(f"  {'✓' if ok else '✗'} {note:<25} → \${bal:,.2f}")

print("\\n=== Full Statement ===")
show_history(acc)

print("\\n=== Summary ===")
summary = transaction_summary(acc)

for key, value in summary.items():
    if isinstance(value, float):
        print(f"  {key}: \${value:,.2f}")
    else:
        print(f"  {key}: {value}")
`,
    },

    expectedOutput: `=== Simulating Transactions ===
  ✓ Salary                    → $3,500.00
  ✓ Rent                      → $2,650.00
  ✓ Groceries                 → $2,529.50
  ✓ Freelance payment         → $2,729.50
  ✓ Streaming services        → $2,683.51
  ✓ Credit card               → $2,383.51
  ✓ Birthday gift             → $2,433.51
  ✓ Phone bill                → $2,343.52

=== Summary ===
  total_transactions: 9
  total_deposited: $2,750.00
  total_withdrawn: $1,406.48
  net_change: $1,343.52`,
  },

  {
    titleEn: "Step 3 — The BankAccount Class",
    titleFr: "Étape 3 — La classe BankAccount",
    contentEn: `## Step 3 — The BankAccount Class

Now we upgrade to a class.

\`\`\`
With functions:
  deposit(account, amount)

With a class:
  account.deposit(amount)
\`\`\`

A class bundles data and behavior together.`,

    contentFr: `## Étape 3 — La classe BankAccount

Nous passons maintenant à une classe.

\`\`\`
Avec des fonctions :
  deposit(account, amount)

Avec une classe :
  account.deposit(amount)
\`\`\``,

    starterCode: {
      default: `# Step 3: BankAccount class

from datetime import datetime

class BankAccount:
    """
    A bank account with deposits, withdrawals, history,
    and optional overdraft protection.
    """

    def __init__(self, owner, initial_balance=0.0, number="ACC-001", overdraft_limit=0.0):
        if initial_balance < 0:
            raise ValueError("Initial balance cannot be negative.")
        if overdraft_limit < 0:
            raise ValueError("Overdraft limit must be non-negative.")

        self._owner = owner
        self._balance = float(initial_balance)
        self._number = number
        self._overdraft = float(overdraft_limit)
        self._history = []
        self._frozen = False

        if initial_balance > 0:
            self._record("opening", initial_balance, "Account opened")

    @property
    def owner(self):
        return self._owner

    @property
    def balance(self):
        return self._balance

    @property
    def number(self):
        return self._number

    @property
    def is_frozen(self):
        return self._frozen

    @property
    def available(self):
        """Maximum amount that can be withdrawn right now."""
        return self._balance + self._overdraft

    def _record(self, txn_type, amount, note=""):
        self._history.append({
            "type": txn_type,
            "amount": round(amount, 2),
            "balance": round(self._balance, 2),
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "note": note,
        })

    def _validate_amount(self, amount):
        if not isinstance(amount, (int, float)):
            return False, "Amount must be a number."
        if amount <= 0:
            return False, "Amount must be positive."
        return True, ""

    def deposit(self, amount, note=""):
        if self._frozen:
            return False, "Account is frozen. Contact support."

        ok, err = self._validate_amount(amount)
        if not ok:
            return False, err

        self._balance = round(self._balance + amount, 2)
        self._record("deposit", amount, note)

        return True, f"Deposited \${amount:,.2f}. New balance: \${self._balance:,.2f}."

    def withdraw(self, amount, note=""):
        if self._frozen:
            return False, "Account is frozen. Contact support."

        ok, err = self._validate_amount(amount)
        if not ok:
            return False, err

        if amount > self.available:
            return False, (
                f"Insufficient funds. "
                f"Available: \${self.available:,.2f} "
                f"(balance \${self._balance:,.2f}"
                + (f" + \${self._overdraft:,.2f} overdraft" if self._overdraft else "")
                + ")."
            )

        self._balance = round(self._balance - amount, 2)
        self._record("withdrawal", amount, note)

        return True, f"Withdrew \${amount:,.2f}. New balance: \${self._balance:,.2f}."

    def freeze(self):
        self._frozen = True
        self._record("freeze", 0, "Account frozen")
        return True, "Account frozen."

    def unfreeze(self):
        self._frozen = False
        self._record("unfreeze", 0, "Account unfrozen")
        return True, "Account unfrozen."

    def statement(self, last_n=None):
        history = self._history[-last_n:] if last_n else self._history

        lines = [
            f"  {'─'*65}",
            f"  ACCOUNT STATEMENT — {self._owner} ({self._number})",
            f"  {'─'*65}",
            f"  {'Date/Time':<22} {'Type':<12} {'Amount':>12} {'Balance':>12}",
            f"  {'─'*65}",
        ]

        for t in history:
            sign = "+" if t["type"] in ("deposit", "opening") else "-"
            amount = f"{sign}\${t['amount']:>10,.2f}" if t["amount"] else " " * 12
            bal = f"\${t['balance']:>11,.2f}"
            note = f"  {t['note']}" if t["note"] else ""

            lines.append(f"  {t['time']:<22} {t['type']:<12} {amount} {bal}{note}")

        lines.append(f"  {'─'*65}")
        lines.append(f"  Current balance: \${self._balance:,.2f}")

        if self._overdraft:
            lines.append(f"  Overdraft limit: \${self._overdraft:,.2f}")
            lines.append(f"  Available:       \${self.available:,.2f}")

        lines.append(f"  {'─'*65}")

        return "\\n".join(lines)

    def __repr__(self):
        frozen = " [FROZEN]" if self._frozen else ""
        return f"BankAccount({self._owner}, \${self._balance:,.2f}{frozen})"


# --- Test ---
print("=== Standard Account ===")
acc = BankAccount("Alice Johnson", 1000.00, "ACC-001")

acc.deposit(2500, "Salary")
acc.withdraw(850, "Rent")
acc.withdraw(120.50, "Groceries")
acc.deposit(200, "Freelance")

print(acc.statement())

print("\\n=== Overdraft Account ===")
od = BankAccount("Bob Smith", 500.00, "ACC-002", overdraft_limit=200.0)

print(f"Balance: \${od.balance:,.2f}, Available: \${od.available:,.2f}")

ok, msg = od.withdraw(600, "Emergency")
print(f"  {'✓' if ok else '✗'} {msg}")

ok, msg = od.withdraw(150, "More spending")
print(f"  {'✓' if ok else '✗'} {msg}")

print("\\n=== Frozen Account ===")
acc.freeze()

ok, msg = acc.deposit(100, "Blocked deposit")
print(f"  {'✓' if ok else '✗'} {msg}")

acc.unfreeze()

ok, msg = acc.deposit(100, "Unblocked deposit")
print(f"  {'✓' if ok else '✗'} {msg}")

print(acc)
`,
    },

    expectedOutput: `=== Standard Account ===
  Current balance: $2,729.50

=== Overdraft Account ===
Balance: $500.00, Available: $700.00
  ✓ Withdrew $600.00. New balance: -$100.00.
  ✗ Insufficient funds. Available: $100.00 (balance $-100.00 + $200.00 overdraft).

=== Frozen Account ===
  ✗ Account is frozen. Contact support.
  ✓ Deposited $100.00. New balance: $2,829.50.
BankAccount(Alice Johnson, $2,829.50)`,
  },
];
