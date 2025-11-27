import sqlite3
import time

conn = sqlite3.connect('./app.db')
c = conn.cursor()

# Get first employer ID
c.execute('SELECT id FROM employers LIMIT 1')
result = c.fetchone()
if result:
    emp_id = result[0]
    # Archive this employer
    c.execute('UPDATE employers SET archived = 1, archived_at = ? WHERE id = ?', (int(time.time() * 1000), emp_id))
    conn.commit()
    
    # Check if it worked
    c.execute('SELECT COUNT(*) as archived FROM employers WHERE archived = 1')
    archived_count = c.fetchone()[0]
    print(f'Archived count: {archived_count}')
    print(f'Archived employer ID: {emp_id}')
else:
    print('No employers found')

conn.close()
