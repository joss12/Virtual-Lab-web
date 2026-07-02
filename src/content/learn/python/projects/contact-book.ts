export const id = "contact-book";
export const titleEn = "Contact Book";
export const titleFr = "Carnet de contacts";
export const descriptionEn =
  "A full CRUD contact manager — add, search, update, delete contacts stored in a dictionary.";
export const descriptionFr =
  "Un gestionnaire de contacts CRUD complet — ajoutez, recherchez, modifiez, supprimez des contacts.";

export const steps = [
  {
    titleEn: "Step 1 — Designing the Contact Structure",
    titleFr: "Étape 1 — Concevoir la structure d'un contact",
    contentEn: `## Step 1 — Designing the Contact Structure

Before writing any code, we make the most important decision: **how to represent a contact**.

A contact has several pieces of information. We need to decide:
1. What fields does a contact have?
2. What is required vs optional?
3. How do we uniquely identify each contact?

\`\`\`
What a contact needs:
  name     → required (can't have a nameless contact)
  phone    → optional (might not have it)
  email    → optional (might not have it)
  address  → optional
  notes    → optional (any extra info)

How to identify uniquely:
  Option A: use the name as the key → problem: two "John Smith" contacts
  Option B: generate a unique ID    → always works, no collisions
\`\`\`

We use a **unique ID** (a counter that increments) as the key. This is the same approach databases use — every record has a unique numeric ID that never changes, even if the name or phone number is updated.

\`\`\`
contacts = {
    1: {"name": "Alice",  "phone": "+1 555 1234", "email": "alice@ex.com"},
    2: {"name": "Bob",    "phone": "+1 555 5678", "email": ""},
    3: {"name": "Carol",  "phone": "",             "email": "carol@ex.com"},
}
\`\`\`

The ID is the **key**. The contact data is the **value** — a dictionary with all fields.`,

    contentFr: `## Étape 1 — Concevoir la structure d'un contact

Avant d'écrire du code, nous prenons la décision la plus importante : **comment représenter un contact**.

Nous utilisons un **ID unique** (un compteur qui s'incrémente) comme clé. C'est la même approche qu'utilisent les bases de données — chaque enregistrement a un ID numérique unique qui ne change jamais.

\`\`\`
contacts = {
    1: {"nom": "Alice",  "tel": "+33 6 12 34 56", "email": "alice@ex.com"},
    2: {"nom": "Bob",    "tel": "+33 6 78 90 12", "email": ""},
    3: {"nom": "Carol",  "tel": "",                "email": "carol@ex.com"},
}
\`\`\``,

    starterCode: {
      default: `# Step 1: Contact structure and basic operations

# The contact book: ID → contact dict
contacts = {}
next_id = 1   # auto-incrementing ID counter

def make_contact(name, phone="", email="", address="", notes=""):
    """
    Create a contact dictionary with all fields.
    Only 'name' is required — all others default to empty string.
    """
    return {
        "name":    name.strip(),
        "phone":   phone.strip(),
        "email":   email.strip().lower(),   # emails are case-insensitive
        "address": address.strip(),
        "notes":   notes.strip(),
    }

def add_contact(name, phone="", email="", address="", notes=""):
    """Add a new contact and return its ID."""
    global next_id

    if not name.strip():
        print("  Error: name cannot be empty.")
        return None

    contact = make_contact(name, phone, email, address, notes)
    contacts[next_id] = contact
    contact_id = next_id
    next_id += 1
    return contact_id

def display_contact(contact_id):
    """Display a single contact's information."""
    if contact_id not in contacts:
        print(f"  Contact #{contact_id} not found.")
        return

    c = contacts[contact_id]
    print(f"  ┌─ Contact #{contact_id} ──────────────────")
    print(f"  │ Name:    {c['name']}")
    if c['phone']:   print(f"  │ Phone:   {c['phone']}")
    if c['email']:   print(f"  │ Email:   {c['email']}")
    if c['address']: print(f"  │ Address: {c['address']}")
    if c['notes']:   print(f"  │ Notes:   {c['notes']}")
    print(f"  └──────────────────────────────────")

# Test the structure
print("=== Building the Contact Book ===\\n")

id1 = add_contact("Alice Johnson",
                  phone="+1 555 1234",
                  email="alice@example.com",
                  address="123 Main St, NYC")

id2 = add_contact("Bob Smith",
                  phone="+1 555 5678",
                  notes="Met at conference 2024")

id3 = add_contact("Carol Davis",
                  email="carol@example.com",
                  address="456 Oak Ave, LA")

id4 = add_contact("")  # should fail — empty name

print(f"Added contacts with IDs: {id1}, {id2}, {id3}")
print(f"Total contacts: {len(contacts)}\\n")

print("=== Individual Contacts ===\\n")
for cid in [id1, id2, id3]:
    display_contact(cid)

# Show raw structure
print("=== Raw Data Structure ===")
for cid, contact in contacts.items():
    print(f"  {cid}: {contact}")
`,
    },
    expectedOutput: `=== Building the Contact Book ===

  Error: name cannot be empty.
Added contacts with IDs: 1, 2, 3
Total contacts: 3

=== Individual Contacts ===

  ┌─ Contact #1 ──────────────────
  │ Name:    Alice Johnson
  │ Phone:   +1 555 1234
  │ Email:   alice@example.com
  │ Address: 123 Main St, NYC
  └──────────────────────────────────
  ┌─ Contact #2 ──────────────────
  │ Name:    Bob Smith
  │ Phone:   +1 555 5678
  │ Notes:   Met at conference 2024
  └──────────────────────────────────
  ┌─ Contact #3 ──────────────────
  │ Name:    Carol Davis
  │ Email:   carol@example.com
  │ Address: 456 Oak Ave, LA
  └──────────────────────────────────

=== Raw Data Structure ===
  1: {'name': 'Alice Johnson', 'phone': '+1 555 1234', 'email': 'alice@example.com', 'address': '123 Main St, NYC', 'notes': ''}
  2: {'name': 'Bob Smith', 'phone': '+1 555 5678', 'email': '', 'address': '', 'notes': 'Met at conference 2024'}
  3: {'name': 'Carol Davis', 'phone': '', 'email': 'carol@example.com', 'address': '456 Oak Ave, LA', 'notes': ''}`,
  },

  {
    titleEn: "Step 2 — Searching Contacts",
    titleFr: "Étape 2 — Rechercher des contacts",
    contentEn: `## Step 2 — Searching Contacts

A contact book is useless if you can't find contacts quickly. This step adds **flexible search** — find contacts by name, phone, or email.

The key design decision: **case-insensitive, partial matching**. Nobody types the exact full name when searching. They type part of a name and expect to see matching results.

\`\`\`
Search "ali":
  → finds "Alice Johnson" ✓  (partial match, case-insensitive)
  → finds "Natalie Brown" ✓  (partial match in middle)

Search "555":
  → finds contacts with "555" anywhere in their phone number

Search "@gmail":
  → finds all Gmail users
\`\`\`

The search implementation loops through all contacts and checks if the query appears in any searchable field. This is O(N) — linear search. For a personal contact book with hundreds of contacts, this is perfectly fast.

For millions of contacts (like a company directory), you'd build an index. But optimizing before you need to is a waste — start simple, optimize when the problem appears.`,

    contentFr: `## Étape 2 — Rechercher des contacts

La décision de conception clé : **correspondance partielle insensible à la casse**. Personne ne tape le nom complet exact lors d'une recherche.

\`\`\`
Recherche "ali" :
  → trouve "Alice Johnson" ✓  (correspondance partielle)
  → trouve "Natalie Brown" ✓  (correspondance partielle au milieu)
\`\`\`

La recherche boucle sur tous les contacts et vérifie si la requête apparaît dans n'importe quel champ. C'est O(N) — parfaitement rapide pour un carnet personnel.`,

    starterCode: {
      default: `# Step 2: Searching contacts

contacts = {
    1: {"name": "Alice Johnson",  "phone": "+1 555 1234", "email": "alice@gmail.com",   "address": "123 Main St",  "notes": ""},
    2: {"name": "Bob Smith",      "phone": "+1 555 5678", "email": "bob@company.com",   "address": "",              "notes": "Conference 2024"},
    3: {"name": "Carol Davis",    "phone": "+44 20 1234", "email": "carol@gmail.com",   "address": "London, UK",    "notes": ""},
    4: {"name": "David Alice",    "phone": "+1 555 9999", "email": "david@example.com", "address": "NYC",           "notes": "Old friend"},
    5: {"name": "Eve Williams",   "phone": "+33 6 12 34", "email": "eve@gmail.com",     "address": "Paris, France", "notes": ""},
}

def search_contacts(query, field=None):
    """
    Search contacts by query string.

    field=None:    search ALL fields (name, phone, email, address, notes)
    field="name":  search only the name field
    field="phone": search only phone
    etc.

    Case-insensitive, partial matching.
    Returns list of (id, contact) tuples.
    """
    query = query.lower().strip()
    if not query:
        return list(contacts.items())   # empty query = return all

    results = []
    searchable_fields = ["name", "phone", "email", "address", "notes"]

    for contact_id, contact in contacts.items():
        if field:
            # Search specific field only
            if query in contact.get(field, "").lower():
                results.append((contact_id, contact))
        else:
            # Search ALL fields
            for f in searchable_fields:
                if query in contact.get(f, "").lower():
                    results.append((contact_id, contact))
                    break   # found in one field, no need to check others

    return results

def display_results(results, query=""):
    """Display search results."""
    if not results:
        print(f"  No contacts found{' for ' + repr(query) if query else ''}.")
        return

    print(f"  Found {len(results)} contact(s){' for ' + repr(query) if query else ''}:")
    for contact_id, contact in results:
        phone_str = f" | {contact['phone']}" if contact['phone'] else ""
        email_str = f" | {contact['email']}" if contact['email'] else ""
        print(f"    #{contact_id:<3} {contact['name']:<20}{phone_str}{email_str}")

# Test various searches
print("=== Search: 'alice' (all fields) ===")
display_results(search_contacts("alice"), "alice")
# Should find Alice Johnson AND David Alice

print("\\n=== Search: 'gmail' (all fields) ===")
display_results(search_contacts("gmail"), "gmail")
# Should find Alice, Carol, Eve

print("\\n=== Search: '555' (phone only) ===")
display_results(search_contacts("555", field="phone"), "555")
# Should find Alice, Bob, David

print("\\n=== Search: 'london' (address only) ===")
display_results(search_contacts("london", field="address"), "london")

print("\\n=== Search: 'conference' (notes only) ===")
display_results(search_contacts("conference", field="notes"), "conference")

print("\\n=== Search: 'xyz' (no results) ===")
display_results(search_contacts("xyz"), "xyz")

print("\\n=== Search: '' (empty = all contacts) ===")
display_results(search_contacts(""))
`,
    },
    expectedOutput: `=== Search: 'alice' (all fields) ===
  Found 2 contact(s) for 'alice':
    #1   Alice Johnson         | +1 555 1234 | alice@gmail.com
    #4   David Alice           | +1 555 9999 | david@example.com

=== Search: 'gmail' (all fields) ===
  Found 3 contact(s) for 'gmail':
    #1   Alice Johnson         | +1 555 1234 | alice@gmail.com
    #3   Carol Davis           | +44 20 1234 | carol@gmail.com
    #5   Eve Williams          | +33 6 12 34 | eve@gmail.com

=== Search: '555' (phone only) ===
  Found 3 contact(s) for '555':
    #1   Alice Johnson         | +1 555 1234 | alice@gmail.com
    #2   Bob Smith             | +1 555 5678 | bob@company.com
    #4   David Alice           | +1 555 9999 | david@example.com

=== Search: 'london' (address only) ===
  Found 1 contact(s) for 'london':
    #3   Carol Davis           | +44 20 1234 | carol@gmail.com

=== Search: 'conference' (notes only) ===
  Found 1 contact(s) for 'conference':
    #2   Bob Smith             | +1 555 5678 | bob@company.com

=== Search: 'xyz' (no results) ===
  No contacts found for 'xyz'.

=== Search: '' (empty = all contacts) ===
  Found 5 contact(s):
    #1   Alice Johnson         | +1 555 1234 | alice@gmail.com
    #2   Bob Smith             | +1 555 5678 | bob@company.com
    #3   Carol Davis           | +44 20 1234 | carol@gmail.com
    #4   David Alice           | +1 555 9999 | david@example.com
    #5   Eve Williams          | +33 6 12 34 | eve@gmail.com`,
  },

  {
    titleEn: "Step 3 — Updating and Deleting Contacts",
    titleFr: "Étape 3 — Modifier et supprimer des contacts",
    contentEn: `## Step 3 — Updating and Deleting Contacts

Now we add the **U** and **D** of CRUD — Update and Delete.

**Updating a contact** has an important design choice: **partial updates**. When updating a contact, you should only change the fields you provide. If you update Alice's phone number, her email, address, and notes should stay unchanged.

\`\`\`
Before update:
  Alice: {name: "Alice", phone: "555-1234", email: "alice@ex.com"}

Update phone only:
  update_contact(1, phone="555-9999")

After update:
  Alice: {name: "Alice", phone: "555-9999", email: "alice@ex.com"}
         ↑ unchanged          ↑ updated     ↑ unchanged
\`\`\`

This is done by only updating the fields that were explicitly provided (not None):

\`\`\`python
if phone is not None:
    contacts[id]["phone"] = phone
# If phone is None (not provided), we skip it
\`\`\`

**Deleting a contact** should ask for confirmation before permanent deletion. This prevents accidental data loss — the most common source of frustration in contact apps. In our simulation, we pass \`confirm=True\` to bypass the prompt.`,

    contentFr: `## Étape 3 — Modifier et supprimer des contacts

**Mettre à jour un contact** a un choix de conception important : **mises à jour partielles**. Quand vous mettez à jour un contact, seuls les champs fournis changent.

\`\`\`
Avant mise à jour :
  Alice: {nom: "Alice", tel: "555-1234", email: "alice@ex.com"}

Mettre à jour le téléphone seulement :
  modifier_contact(1, tel="555-9999")

Après mise à jour :
  Alice: {nom: "Alice", tel: "555-9999", email: "alice@ex.com"}
         ↑ inchangé      ↑ mis à jour    ↑ inchangé
\`\`\``,

    starterCode: {
      default: `# Step 3: Update and delete contacts

contacts = {
    1: {"name": "Alice Johnson",  "phone": "+1 555 1234", "email": "alice@gmail.com",   "address": "123 Main St", "notes": ""},
    2: {"name": "Bob Smith",      "phone": "+1 555 5678", "email": "bob@company.com",   "address": "",            "notes": "Conference 2024"},
    3: {"name": "Carol Davis",    "phone": "+44 20 1234", "email": "carol@gmail.com",   "address": "London, UK",  "notes": ""},
}

def update_contact(contact_id, name=None, phone=None,
                   email=None, address=None, notes=None):
    """
    Update specific fields of an existing contact.
    Only updates fields that are explicitly provided (not None).
    Returns True on success, False if contact not found.
    """
    if contact_id not in contacts:
        print(f"  Error: Contact #{contact_id} not found.")
        return False

    contact = contacts[contact_id]
    updated_fields = []

    if name is not None:
        if not name.strip():
            print("  Error: Name cannot be empty.")
            return False
        contact["name"]    = name.strip()
        updated_fields.append("name")

    if phone   is not None:
        contact["phone"]   = phone.strip()
        updated_fields.append("phone")

    if email   is not None:
        contact["email"]   = email.strip().lower()
        updated_fields.append("email")

    if address is not None:
        contact["address"] = address.strip()
        updated_fields.append("address")

    if notes  is not None:
        contact["notes"]   = notes.strip()
        updated_fields.append("notes")

    if updated_fields:
        print(f"  Updated #{contact_id} ({contact['name']}): {', '.join(updated_fields)}")
    else:
        print(f"  No changes made to #{contact_id}.")

    return True

def delete_contact(contact_id, confirm=False):
    """
    Delete a contact permanently.
    Requires confirm=True to prevent accidental deletion.
    """
    if contact_id not in contacts:
        print(f"  Error: Contact #{contact_id} not found.")
        return False

    name = contacts[contact_id]["name"]

    if not confirm:
        print(f"  Delete '{name}'? Call with confirm=True to proceed.")
        return False

    del contacts[contact_id]
    print(f"  Deleted contact #{contact_id} ({name}).")
    return True

def show_all():
    """Show all contacts in a compact list."""
    print(f"  Contacts ({len(contacts)} total):")
    for cid, c in contacts.items():
        info = []
        if c["phone"]: info.append(c["phone"])
        if c["email"]: info.append(c["email"])
        print(f"    #{cid} {c['name']:<20} {' | '.join(info)}")

# Test updates
print("=== Before Updates ===")
show_all()

print("\\n=== Performing Updates ===")
update_contact(1, phone="+1 555 9999")           # update phone only
update_contact(2, email="bob@gmail.com",
                  notes="Conference 2024 — great talk!")  # update two fields
update_contact(3, name="Carol Williams",
                  address="Manchester, UK")        # update name and address
update_contact(99, phone="000")                   # non-existent contact
update_contact(1, name="")                         # empty name — should fail

print("\\n=== After Updates ===")
show_all()

# Verify partial update — Alice's email should be unchanged
print(f"\\n  Alice's email (should be unchanged): {contacts[1]['email']}")

# Test deletion
print("\\n=== Deletion ===")
delete_contact(2)               # without confirm — should warn
delete_contact(2, confirm=True) # with confirm — deletes
delete_contact(2, confirm=True) # already deleted — should fail

print("\\n=== After Deletion ===")
show_all()
`,
    },
    expectedOutput: `=== Before Updates ===
  Contacts (3 total):
    #1 Alice Johnson          | +1 555 1234 | alice@gmail.com
    #2 Bob Smith              | +1 555 5678 | bob@company.com
    #3 Carol Davis            | +44 20 1234 | carol@gmail.com

=== Performing Updates ===
  Updated #1 (Alice Johnson): phone
  Updated #2 (Bob Smith): email, notes
  Updated #3 (Carol Davis): name, address
  Error: Contact #99 not found.
  Error: Name cannot be empty.

=== After Updates ===
  Contacts (3 total):
    #1 Alice Johnson          | +1 555 9999 | alice@gmail.com
    #2 Bob Smith              | +1 555 5678 | bob@gmail.com
    #3 Carol Williams         | +44 20 1234 | carol@gmail.com

  Alice's email (should be unchanged): alice@gmail.com

=== Deletion ===
  Delete 'Bob Smith'? Call with confirm=True to proceed.
  Deleted contact #2 (Bob Smith).
  Error: Contact #2 not found.

=== After Deletion ===
  Contacts (2 total):
    #1 Alice Johnson          | +1 555 9999 | alice@gmail.com
    #3 Carol Williams         | +44 20 1234 | carol@gmail.com`,
  },

  {
    titleEn: "Step 4 — Sorting and Grouping",
    titleFr: "Étape 4 — Trier et grouper",
    contentEn: `## Step 4 — Sorting and Grouping

A real contact book lets you view contacts in different ways: alphabetically, by recently added, grouped by first letter (A–Z sections), or filtered by completeness.

This step adds several viewing modes:

**Alphabetical listing** — the most common view. Sort by last name if possible (split on space, use last word), fall back to first name.

\`\`\`
Sort key for "Alice Johnson": "johnson alice"  (last name first)
Sort key for "Bob":           "bob"             (single name)
\`\`\`

**A-Z grouping** — like a real address book, group contacts by the first letter of their name. This makes it easy to jump to a specific letter.

\`\`\`
A:  Alice Johnson, Anna Smith
B:  Bob Williams
C:  Carol Davis, Chris Brown
\`\`\`

**Completeness filter** — find contacts that are missing important information like a phone number or email. Useful for finding contacts you need to update.`,

    contentFr: `## Étape 4 — Trier et grouper

Cette étape ajoute plusieurs modes d'affichage :

**Listing alphabétique** — le plus courant. Tri par nom de famille si possible.

**Regroupement A-Z** — comme un vrai carnet d'adresses, groupez les contacts par la première lettre de leur nom.

**Filtre de complétude** — trouvez les contacts auxquels il manque des informations importantes.`,

    starterCode: {
      default: `# Step 4: Sorting and grouping contacts

contacts = {
    1:  {"name": "Alice Johnson",  "phone": "+1 555 1234", "email": "alice@gmail.com",   "address": "NYC",     "notes": ""},
    2:  {"name": "Bob Smith",      "phone": "+1 555 5678", "email": "",                   "address": "",        "notes": ""},
    3:  {"name": "Carol Davis",    "phone": "",             "email": "carol@gmail.com",   "address": "London",  "notes": ""},
    4:  {"name": "David",          "phone": "+1 555 9999", "email": "david@ex.com",       "address": "",        "notes": ""},
    5:  {"name": "Eve Williams",   "phone": "+33 6 12 34", "email": "eve@gmail.com",      "address": "Paris",   "notes": ""},
    6:  {"name": "Anna Brown",     "phone": "+1 555 1111", "email": "anna@company.com",   "address": "Boston",  "notes": ""},
    7:  {"name": "Frank Miller",   "phone": "",             "email": "",                   "address": "",        "notes": ""},
    8:  {"name": "Grace Lee",      "phone": "+82 10 1234", "email": "grace@gmail.com",    "address": "Seoul",   "notes": ""},
    9:  {"name": "Alice Smith",    "phone": "+1 555 2222", "email": "asmith@work.com",    "address": "LA",      "notes": ""},
    10: {"name": "Bob Jones",      "phone": "+1 555 3333", "email": "bjones@gmail.com",   "address": "Chicago", "notes": ""},
}

def sort_key(contact):
    """
    Generate a sort key from a contact name.
    Tries to sort by last name, falls back to full name.
    'Alice Johnson' → 'johnson alice'
    'David'         → 'david'
    """
    name_parts = contact["name"].lower().split()
    if len(name_parts) >= 2:
        return name_parts[-1] + " " + " ".join(name_parts[:-1])
    return name_parts[0]

def sorted_contacts(reverse=False):
    """Return contacts sorted alphabetically (by last name)."""
    return sorted(contacts.items(),
                  key=lambda item: sort_key(item[1]),
                  reverse=reverse)

def grouped_by_letter():
    """Group contacts A-Z by the first letter of their name."""
    groups = {}
    for contact_id, contact in sorted_contacts():
        first_letter = contact["name"][0].upper()
        if first_letter not in groups:
            groups[first_letter] = []
        groups[first_letter].append((contact_id, contact))
    return groups

def incomplete_contacts():
    """Find contacts missing phone OR email."""
    incomplete = []
    for contact_id, contact in contacts.items():
        missing = []
        if not contact["phone"]: missing.append("phone")
        if not contact["email"]: missing.append("email")
        if missing:
            incomplete.append((contact_id, contact, missing))
    return incomplete

# Display sorted list
print("=== Alphabetical (A-Z by last name) ===")
for i, (cid, c) in enumerate(sorted_contacts(), 1):
    phone = c["phone"] or "(no phone)"
    print(f"  {i:>2}. #{cid:<3} {c['name']:<20} {phone}")

# Display Z-A
print("\\n=== Reverse Alphabetical (Z-A) ===")
for cid, c in sorted_contacts(reverse=True):
    print(f"  {c['name']}")

# Display grouped
print("\\n=== A-Z Grouped View ===")
for letter, group in grouped_by_letter().items():
    print(f"  ── {letter} ──")
    for cid, c in group:
        print(f"    {c['name']}")

# Show incomplete contacts
print("\\n=== Incomplete Contacts ===")
incomplete = incomplete_contacts()
if incomplete:
    print(f"  {len(incomplete)} contact(s) need attention:")
    for cid, c, missing in incomplete:
        print(f"  #{cid} {c['name']:<20} missing: {', '.join(missing)}")
else:
    print("  All contacts are complete!")
`,
    },
    expectedOutput: `=== Alphabetical (A-Z by last name) ===
   1. #6   Anna Brown            | +1 555 1111
   2. #3   Carol Davis           | (no phone)
   3. #4   David                 | +1 555 9999
   4. #10  Bob Jones             | +1 555 3333
   5. #1   Alice Johnson         | +1 555 1234
   6. #8   Grace Lee             | +82 10 1234
   7. #7   Frank Miller          | (no phone)
   8. #2   Bob Smith             | +1 555 5678
   9. #9   Alice Smith           | +1 555 2222
  10. #5   Eve Williams          | +33 6 12 34

=== Reverse Alphabetical (Z-A) ===
  Eve Williams
  Alice Smith
  Bob Smith
  Frank Miller
  Grace Lee
  Alice Johnson
  Bob Jones
  David
  Carol Davis
  Anna Brown

=== A-Z Grouped View ===
  ── A ──
    Anna Brown
    Alice Johnson
    Alice Smith
  ── B ──
    Bob Jones
    Bob Smith
  ── C ──
    Carol Davis
  ── D ──
    David
  ── E ──
    Eve Williams
  ── F ──
    Frank Miller
  ── G ──
    Grace Lee

=== Incomplete Contacts ===
  3 contact(s) need attention:
  #2  Bob Smith             missing: email
  #3  Carol Davis           missing: phone
  #7  Frank Miller          missing: phone, email`,
  },

  {
    titleEn: "Step 5 — Import and Export",
    titleFr: "Étape 5 — Importer et exporter",
    contentEn: `## Step 5 — Import and Export

A contact book that can't share data with other applications is an island. This step adds **import and export** in two formats:

1. **JSON** — the native format for our app. Perfect for backup and restore.
2. **CSV** — a universal format that works with Excel, Google Contacts, and almost every other app.

**Exporting to CSV** means converting our nested dictionary into flat rows:

\`\`\`
JSON (our format):                CSV (universal format):
{                                 name,phone,email,address,notes
  "name": "Alice Johnson",        Alice Johnson,+1 555 1234,alice@gmail.com,...
  "phone": "+1 555 1234",
  ...
}
\`\`\`

**Importing from CSV** is the reverse. We must handle:
- The header row (skip it or use it to find column positions)
- Missing fields (CSV might not have all our fields)
- Duplicate detection (don't import a contact that already exists)

The duplicate detection checks if a contact with the same name AND phone already exists. This is a simple heuristic — a real app might use email or a unique ID from the source system.`,

    contentFr: `## Étape 5 — Importer et exporter

Cette étape ajoute l'**import et l'export** en deux formats :

1. **JSON** — le format natif de notre application
2. **CSV** — un format universel compatible avec Excel, Google Contacts, etc.

**Exporter en CSV** signifie convertir notre dictionnaire imbriqué en lignes plates.

La détection des doublons vérifie si un contact avec le même nom ET téléphone existe déjà.`,

    starterCode: {
      default: `# Step 5: Import and export contacts

import json
import csv
import io   # for in-memory CSV (since we can't write files in browser)

contacts = {
    1: {"name": "Alice Johnson",  "phone": "+1 555 1234", "email": "alice@gmail.com", "address": "NYC",    "notes": ""},
    2: {"name": "Bob Smith",      "phone": "+1 555 5678", "email": "bob@work.com",    "address": "",       "notes": "Conference 2024"},
    3: {"name": "Carol Davis",    "phone": "+44 20 1234", "email": "carol@gmail.com", "address": "London", "notes": ""},
}
next_id = 4

# ── JSON Export/Import ───────────────────────────────────
def export_json():
    """Export all contacts as a JSON string."""
    export_data = {
        "version": 1,
        "count":   len(contacts),
        "contacts": [
            {"id": cid, **contact}
            for cid, contact in contacts.items()
        ]
    }
    return json.dumps(export_data, indent=2)

def import_json(json_string):
    """Import contacts from a JSON string. Returns (added, skipped)."""
    global next_id
    try:
        data = json.loads(json_string)
    except json.JSONDecodeError as e:
        print(f"  Invalid JSON: {e}")
        return 0, 0

    added = skipped = 0
    for contact_data in data.get("contacts", []):
        contact_data.pop("id", None)   # remove old ID — we assign new ones
        name  = contact_data.get("name", "")
        phone = contact_data.get("phone", "")

        # Duplicate check: same name AND phone
        is_dup = any(
            c["name"] == name and c["phone"] == phone
            for c in contacts.values()
        )
        if is_dup:
            skipped += 1
            continue

        contacts[next_id] = {
            "name":    contact_data.get("name",    ""),
            "phone":   contact_data.get("phone",   ""),
            "email":   contact_data.get("email",   ""),
            "address": contact_data.get("address", ""),
            "notes":   contact_data.get("notes",   ""),
        }
        next_id += 1
        added += 1

    return added, skipped

# ── CSV Export/Import ────────────────────────────────────
CSV_FIELDS = ["name", "phone", "email", "address", "notes"]

def export_csv():
    """Export all contacts as a CSV string."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=CSV_FIELDS)
    writer.writeheader()
    for contact in contacts.values():
        writer.writerow({f: contact.get(f, "") for f in CSV_FIELDS})
    return output.getvalue()

def import_csv(csv_string):
    """Import contacts from a CSV string. Returns (added, skipped)."""
    global next_id
    added = skipped = 0

    reader = csv.DictReader(io.StringIO(csv_string))
    for row in reader:
        name  = row.get("name",  "").strip()
        phone = row.get("phone", "").strip()

        if not name:
            skipped += 1
            continue

        # Duplicate check
        is_dup = any(
            c["name"] == name and c["phone"] == phone
            for c in contacts.values()
        )
        if is_dup:
            skipped += 1
            continue

        contacts[next_id] = {
            "name":    name,
            "phone":   phone,
            "email":   row.get("email",   "").strip(),
            "address": row.get("address", "").strip(),
            "notes":   row.get("notes",   "").strip(),
        }
        next_id += 1
        added += 1

    return added, skipped

# ── Test Export ──────────────────────────────────────────
print("=== JSON Export ===")
json_output = export_json()
print(json_output)

print("\\n=== CSV Export ===")
csv_output = export_csv()
print(csv_output)

# ── Test Import ──────────────────────────────────────────
# Simulate importing new contacts from another app
new_contacts_csv = """name,phone,email,address,notes
David Lee,+1 555 7777,david@gmail.com,Chicago,
Eve Brown,+1 555 8888,eve@work.com,,New colleague
Alice Johnson,+1 555 1234,alice@gmail.com,NYC,"""
# ^ Alice already exists (same name + phone) → should be skipped

print("=== CSV Import ===")
added, skipped = import_csv(new_contacts_csv)
print(f"  Added: {added}, Skipped (duplicates): {skipped}")

print("\\n=== All Contacts After Import ===")
for cid, c in contacts.items():
    print(f"  #{cid} {c['name']:<20} {c['phone'] or '(no phone)'}")
`,
    },
    expectedOutput: `=== JSON Export ===
{
  "version": 1,
  "count": 3,
  "contacts": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "phone": "+1 555 1234",
      "email": "alice@gmail.com",
      "address": "NYC",
      "notes": ""
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "phone": "+1 555 5678",
      "email": "bob@work.com",
      "address": "",
      "notes": "Conference 2024"
    },
    {
      "id": 3,
      "name": "Carol Davis",
      "phone": "+44 20 1234",
      "email": "carol@gmail.com",
      "address": "London",
      "notes": ""
    }
  ]
}

=== CSV Export ===
name,phone,email,address,notes
Alice Johnson,+1 555 1234,alice@gmail.com,NYC,
Bob Smith,+1 555 5678,bob@work.com,,Conference 2024
Carol Davis,+44 20 1234,carol@gmail.com,London,

=== CSV Import ===
  Added: 2, Skipped (duplicates): 1

=== All Contacts After Import ===
  #1 Alice Johnson          +1 555 1234
  #2 Bob Smith              +1 555 5678
  #3 Carol Davis            +44 20 1234
  #4 David Lee              +1 555 7777
  #5 Eve Brown              +1 555 8888`,
  },

  {
    titleEn: "Step 6 — The Complete ContactBook Class",
    titleFr: "Étape 6 — La classe ContactBook complète",
    contentEn: `## Step 6 — The Complete ContactBook Class

This final step wraps everything into a clean **ContactBook class** with JSON persistence — the contacts survive between sessions.

The class design follows one principle: **every public method returns a result the caller can use**. Methods don't just print — they return success/failure values and data. The caller decides how to display it.

\`\`\`
# Bad: method prints internally, caller can't check success
def add_contact(name):
    if not name:
        print("Error")   # caller can't react to this
    contacts[id] = ...
    print("Added")

# Good: method returns result, caller decides what to do
def add_contact(name):
    if not name:
        return None, "Name is required"
    contacts[id] = ...
    return contact_id, "Added successfully"

# Caller can check:
cid, msg = book.add(name)
if cid:
    show_success(msg)
else:
    show_error(msg)
\`\`\`

This separation of **logic** from **display** makes the code reusable — the same ContactBook class can power a CLI, a web app, or a mobile app without changing the core logic.`,

    contentFr: `## Étape 6 — La classe ContactBook complète

Cette étape finale enveloppe tout dans une classe **ContactBook** propre avec persistance JSON.

Le principe de conception : **chaque méthode publique retourne un résultat** que l'appelant peut utiliser. Les méthodes ne font pas que afficher — elles retournent des valeurs de succès/échec. L'appelant décide comment les afficher.

Cette séparation de la **logique** de l'**affichage** rend le code réutilisable — la même classe peut alimenter une CLI, une app web ou mobile.`,

    starterCode: {
      default: `# Step 6: Complete ContactBook class with persistence

import json
import csv
import io
import os

class ContactBook:
    """
    A complete contact book with CRUD, search, sort, and persistence.
    All methods return (result, message) tuples for clean error handling.
    """

    SAVE_FILE = "contacts.json"

    def __init__(self):
        self._contacts = {}   # id → contact dict
        self._next_id  = 1
        self._load()

    # ── Persistence ───────────────────────────────────────
    def _load(self):
        if not os.path.exists(self.SAVE_FILE):
            return
        try:
            with open(self.SAVE_FILE, "r") as f:
                data = json.load(f)
            for item in data.get("contacts", []):
                cid = item.pop("id")
                self._contacts[cid] = item
                self._next_id = max(self._next_id, cid + 1)
            print(f"Loaded {len(self._contacts)} contacts.")
        except (json.JSONDecodeError, IOError, KeyError):
            self._contacts = {}

    def _save(self):
        data = {
            "version":  1,
            "contacts": [{"id": cid, **c} for cid, c in self._contacts.items()]
        }
        with open(self.SAVE_FILE, "w") as f:
            json.dump(data, f, indent=2)

    # ── CRUD ─────────────────────────────────────────────
    def add(self, name, phone="", email="", address="", notes=""):
        if not name.strip():
            return None, "Name is required."
        cid = self._next_id
        self._contacts[cid] = {
            "name": name.strip(), "phone": phone.strip(),
            "email": email.strip().lower(), "address": address.strip(),
            "notes": notes.strip()
        }
        self._next_id += 1
        self._save()
        return cid, f"Added '{name}' as contact #{cid}."

    def update(self, contact_id, **kwargs):
        if contact_id not in self._contacts:
            return False, f"Contact #{contact_id} not found."
        c = self._contacts[contact_id]
        updated = []
        for field in ["name", "phone", "email", "address", "notes"]:
            if field in kwargs and kwargs[field] is not None:
                if field == "name" and not kwargs[field].strip():
                    return False, "Name cannot be empty."
                c[field] = kwargs[field].strip()
                updated.append(field)
        self._save()
        return True, f"Updated {', '.join(updated)} for #{contact_id}."

    def delete(self, contact_id, confirm=False):
        if contact_id not in self._contacts:
            return False, f"Contact #{contact_id} not found."
        if not confirm:
            name = self._contacts[contact_id]["name"]
            return False, f"Delete '{name}'? Pass confirm=True."
        name = self._contacts[contact_id]["name"]
        del self._contacts[contact_id]
        self._save()
        return True, f"Deleted '{name}' (#{contact_id})."

    def get(self, contact_id):
        return self._contacts.get(contact_id)

    # ── Search & Sort ─────────────────────────────────────
    def search(self, query, field=None):
        query = query.lower().strip()
        fields = ["name", "phone", "email", "address", "notes"]
        results = []
        for cid, c in self._contacts.items():
            search_in = [c.get(field, "")] if field else [c.get(f,"") for f in fields]
            if any(query in v.lower() for v in search_in):
                results.append((cid, c))
        return results

    def all_sorted(self):
        def key(item):
            parts = item[1]["name"].lower().split()
            return (parts[-1] + " " + " ".join(parts[:-1])) if len(parts)>1 else parts[0]
        return sorted(self._contacts.items(), key=key)

    # ── Export ────────────────────────────────────────────
    def to_csv(self):
        out = io.StringIO()
        fields = ["name","phone","email","address","notes"]
        w = csv.DictWriter(out, fieldnames=fields)
        w.writeheader()
        for c in self._contacts.values():
            w.writerow({f: c.get(f,"") for f in fields})
        return out.getvalue()

    # ── Stats ─────────────────────────────────────────────
    def stats(self):
        total    = len(self._contacts)
        with_phone  = sum(1 for c in self._contacts.values() if c["phone"])
        with_email  = sum(1 for c in self._contacts.values() if c["email"])
        incomplete  = sum(1 for c in self._contacts.values()
                         if not c["phone"] or not c["email"])
        return {
            "total": total, "with_phone": with_phone,
            "with_email": with_email, "incomplete": incomplete
        }

    def __len__(self):
        return len(self._contacts)

    def __repr__(self):
        return f"ContactBook({len(self)} contacts)"


# ── Full demo ────────────────────────────────────────────
book = ContactBook()

print("\\n=== Adding Contacts ===")
for args in [
    ("Alice Johnson", "+1 555 1234", "alice@gmail.com",  "NYC",    ""),
    ("Bob Smith",     "+1 555 5678", "bob@work.com",     "",       "Conference 2024"),
    ("Carol Davis",   "+44 20 1234", "carol@gmail.com",  "London", ""),
    ("David Lee",     "",             "david@gmail.com", "Chicago", ""),
    ("Eve Williams",  "+33 6 1234",  "eve@gmail.com",    "Paris",  ""),
    ("",              "",             "",                 "",       ""),  # should fail
]:
    cid, msg = book.add(*args)
    print(f"  {msg}")

print(f"\\n{book}")

print("\\n=== Search: 'gmail' ===")
for cid, c in book.search("gmail"):
    print(f"  #{cid} {c['name']}")

print("\\n=== Update Bob's email ===")
ok, msg = book.update(2, email="bob@gmail.com", notes="Updated at reunion")
print(f"  {msg}")

print("\\n=== Delete (safe) ===")
ok, msg = book.delete(5)
print(f"  {msg}")
ok, msg = book.delete(5, confirm=True)
print(f"  {msg}")

print("\\n=== All Contacts (sorted) ===")
for cid, c in book.all_sorted():
    phone = c["phone"] or "(no phone)"
    print(f"  #{cid:<3} {c['name']:<20} {phone}")

print("\\n=== Statistics ===")
s = book.stats()
for k, v in s.items():
    print(f"  {k}: {v}")

print("\\n=== CSV Export ===")
print(book.to_csv())
`,
    },
    expectedOutput: `=== Adding Contacts ===
  Added 'Alice Johnson' as contact #1.
  Added 'Bob Smith' as contact #2.
  Added 'Carol Davis' as contact #3.
  Added 'David Lee' as contact #4.
  Added 'Eve Williams' as contact #5.
  Name is required.

ContactBook(5 contacts)

=== Search: 'gmail' ===
  #1 Alice Johnson
  #3 Carol Davis
  #4 David Lee
  #5 Eve Williams

=== Update Bob's email ===
  Updated email, notes for #2.

=== Delete (safe) ===
  Delete 'Eve Williams'? Pass confirm=True.
  Deleted 'Eve Williams' (#5).

=== All Contacts (sorted) ===
  #3   Carol Davis           +44 20 1234
  #4   David Lee             (no phone)
  #1   Alice Johnson         +1 555 1234
  #2   Bob Smith             +1 555 5678

=== Statistics ===
  total: 4
  with_phone: 3
  with_email: 4
  incomplete: 1

=== CSV Export ===
name,phone,email,address,notes
Alice Johnson,+1 555 1234,alice@gmail.com,NYC,
Bob Smith,+1 555 5678,bob@gmail.com,,Updated at reunion
Carol Davis,+44 20 1234,carol@gmail.com,London,
David Lee,,david@gmail.com,Chicago,`,
  },
];
