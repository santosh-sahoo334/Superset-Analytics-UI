import pandas as pd
from datetime import datetime, timedelta
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# ========== SAMPLE DATA - WEEKLY ALERT ==========
data_weekly = {
    ('Provider',): ['AWS'],
    ('Account',): ['BFDL Prod Account'],
    ('Resource',): ['AWS Marketplace'],
    ('Week',): ['2025-10-20 00:00:00'],
    ('Cost on Week',): ['$ 70.03'],
    ('Prev. Week Cost',): ['$ 38.57'],
    ('WoW Increase by',): ['$ 31.46'],
    ('WoW % Change',): ['81.54%']
}

# ========== SAMPLE DATA - MONTHLY ALERT ==========
data_monthly = {
    ('Provider',): ['AWS'],
    ('Account',): ['Prod'],
    ('Resource',): ['AmazonRDS'],
    ('Month',): ['2025-10-01 00:00:00'],
    ('$ Current Month',): ['$ 1492.75'],
    ('$ MoM Increased by',): ['$ 852.08'],
    ('$ Prev. Month',): ['$ 640.67'],
    ('MoM % Change',): ['133.00%']
}

# ========== SAMPLE DATA - DAILY ALERT (NO TUPLES) ==========
data_daily = {
    'Provider': ['GCP'],
    'Account': ['Dev Account'],
    'Resource': ['Compute Engine'],
    'Date': ['2025-10-28 00:00:00'],
    'Cost on Date': ['$ 250.50'],
    'Prev. Day Cost': ['$ 200.00'],
    'Increased by': ['$ 50.50'],
    'DoD% Change': ['25.25%']
}

# ========== SELECT WHICH TEST TO RUN ==========
print("Select test:")
print("1. Weekly Alert")
print("2. Monthly Alert")
print("3. Daily Alert")
test_type = input("Enter choice (1/2/3) or press Enter for Weekly: ").strip() or "1"

if test_type == "1":
    data = data_weekly
    test_name = "WEEKLY ALERT"
elif test_type == "2":
    data = data_monthly
    test_name = "MONTHLY ALERT"
else:
    data = data_daily
    test_name = "DAILY ALERT"

# Create DataFrame with tuple columns (simulating what Superset sends)
df = pd.DataFrame(data)

print("\n" + "=" * 80)
print(f"TESTING: {test_name}")
print("=" * 80)
print("\n" + "=" * 80)
print("ORIGINAL DATAFRAME")
print("=" * 80)
print(df)
print(f"\nOriginal columns: {df.columns.tolist()}")
print(f"Column types: {[type(col) for col in df.columns]}")

# ========== START OF SUPERSET CODE ==========

# Step 1: Flatten tuple column names to strings
if df.columns.nlevels > 1 or isinstance(df.columns[0], tuple):
    df.columns = [col[0] if isinstance(col, tuple) else col for col in df.columns]

logger.info(f"Original DataFrame columns: {df.columns.tolist()}")

column_mapping = {}
date_column_value = None
alert_type = None

# Step 2: Identify alert type and extract the date from the date column
for col in df.columns:
    col_lower = col.lower()
    
    # Check for Daily Alert - look for "Date" column
    if col_lower == 'date' and not df.empty:
        alert_type = 'daily'
        date_column_value = str(df[col].iloc[0])
        logger.info(f"Detected Daily Alert with date: {date_column_value}")
        break
    
    # Check for Weekly Alert - look for "Week" column
    elif col_lower == 'week' and not df.empty:
        alert_type = 'weekly'
        date_column_value = str(df[col].iloc[0])
        logger.info(f"Detected Weekly Alert with week: {date_column_value}")
        break
    
    # Check for Monthly Alert - look for "Month" column
    elif col_lower == 'month' and not df.empty:
        alert_type = 'monthly'
        date_column_value = str(df[col].iloc[0])
        logger.info(f"Detected Monthly Alert with month: {date_column_value}")
        break

# Step 3: Calculate previous date based on alert type
if date_column_value and alert_type:
    try:
        # Handle both date strings and datetime objects
        if isinstance(date_column_value, str):
            # Try parsing with time component first
            if ' ' in date_column_value:
                current_date_obj = datetime.strptime(date_column_value.split(' ')[0], '%Y-%m-%d')
            else:
                current_date_obj = datetime.strptime(date_column_value, '%Y-%m-%d')
        else:
            # If it's already a datetime object (from pandas)
            current_date_obj = date_column_value
        
        if alert_type == 'daily':
            current_date_str = current_date_obj.strftime('%Y-%m-%d')
            previous_date_str = (current_date_obj - timedelta(days=1)).strftime('%Y-%m-%d')
            
            # Define column mappings for Daily Alert
            logger.info("\n--- Checking columns for Daily Alert ---")
            for col in df.columns:
                col_lower = col.lower()
                logger.info(f"Column: '{col}' -> lowercase: '{col_lower}'")
                
                if 'cost on date' in col_lower:
                    column_mapping[col] = f'Cost on {current_date_str}'
                    logger.info(f"  ✓ Mapped to: Cost on {current_date_str}")
                elif 'prev. day cost' in col_lower or 'prev day cost' in col_lower:
                    column_mapping[col] = f'Cost on {previous_date_str}'
                    logger.info(f"  ✓ Mapped to: Prev. Day Cost on {previous_date_str}")
        
        elif alert_type == 'weekly':
            current_date_str = current_date_obj.strftime('%Y-%m-%d')
            previous_date_str = (current_date_obj - timedelta(weeks=1)).strftime('%Y-%m-%d')
            
            # Define column mappings for Weekly Alert
            logger.info("\n--- Checking columns for Weekly Alert ---")
            for col in df.columns:
                col_lower = col.lower()
                logger.info(f"Column: '{col}' -> lowercase: '{col_lower}'")
                logger.info(f"  Contains 'cost on week': {'cost on week' in col_lower}")
                logger.info(f"  Contains 'prev. week cost': {'prev. week cost' in col_lower}")
                
                if 'cost on week' in col_lower:
                    column_mapping[col] = f'Cost on Week starting {current_date_str}'
                    logger.info(f"  ✓ Mapped to: Cost on Week {current_date_str}")
                elif 'prev. week cost' in col_lower or 'prev week cost' in col_lower:
                    column_mapping[col] = f'Cost on Week starting {previous_date_str}'
                    logger.info(f"  ✓ Mapped to: Prev. Week Cost on {previous_date_str}")
        
        elif alert_type == 'monthly':
            # Format: "October 2025" instead of "2025-10-01"
            current_month_str = current_date_obj.strftime('%b %Y')
            
            # Calculate previous month (handle year boundary)
            if current_date_obj.month == 1:
                previous_month_obj = current_date_obj.replace(
                    year=current_date_obj.year - 1, 
                    month=12
                )
            else:
                previous_month_obj = current_date_obj.replace(
                    month=current_date_obj.month - 1
                )
            previous_month_str = previous_month_obj.strftime('%b %Y')
            
            # Define column mappings for Monthly Alert
            logger.info("\n--- Checking columns for Monthly Alert ---")
            for col in df.columns:
                col_lower = col.lower()
                logger.info(f"Column: '{col}' -> lowercase: '{col_lower}'")
                logger.info(f"  Contains '$ current month': {'$ current month' in col_lower}")
                logger.info(f"  Contains '$ prev. month': {'$ prev. month' in col_lower}")
                
                if '$ current month' in col_lower:
                    column_mapping[col] = f'Cost - {current_month_str}'
                    logger.info(f"  ✓ Mapped to: Cost - {current_month_str}")
                elif '$ prev. month' in col_lower:
                    column_mapping[col] = f'Cost - {previous_month_str}'
                    logger.info(f"  ✓ Mapped to: Cost - {previous_month_str}")
        
        logger.info(f"\nColumn mapping to apply: {column_mapping}")
        
    except (ValueError, AttributeError) as e:
        logger.error(f"Error parsing date from column: {e}")

# Step 4: Apply the renaming
if column_mapping:
    df = df.rename(columns=column_mapping)
    
    # Drop the date/week/month columns
    columns_to_drop = [col for col in df.columns if col.lower() in ['date', 'week', 'month']]
    if columns_to_drop:
        df = df.drop(columns=columns_to_drop)
        logger.info(f"Dropped columns: {columns_to_drop}")
    
    # Reorder columns to group cost columns together
    # Keep Provider, Account, Resource first, then cost columns, then change columns
    base_cols = ['Provider', 'Account', 'Resource']
    cost_cols = [col for col in df.columns if 'Cost' in col and ('$' not in col or col.startswith('$'))]
    # Separate renamed cost columns from original $ columns
    renamed_cost_cols = [col for col in cost_cols if not col.startswith('$')]
    other_cols = [col for col in df.columns if col not in base_cols and col not in renamed_cost_cols]
    
    # Filter to only existing columns
    new_order = [col for col in base_cols if col in df.columns] + renamed_cost_cols + other_cols
    df = df[new_order]
    
    logger.info(f"Final columns after reordering: {df.columns.tolist()}")
else:
    logger.warning("No columns were renamed. Check if column names match expected patterns.")

# Step 5: Reset index to start from 1
df.index = range(1, len(df) + 1)

# ========== END OF SUPERSET CODE ==========

print("\n" + "=" * 80)
print("FINAL DATAFRAME")
print("=" * 80)
print(df)
print(f"\nFinal columns: {df.columns.tolist()}")

# Step 6: Convert to HTML (as Superset does)
html_table = df.to_html(na_rep="", index=True, escape=True)
print("\n" + "=" * 80)
print("HTML OUTPUT (first 500 chars)")
print("=" * 80)
print(html_table[:602] + "...")