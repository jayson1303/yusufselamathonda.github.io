import os
import json
import pandas as pd
import numpy as np

excel_file = r"Pricelist\PL JULI 2026 DP BESAR.xls"
foto_dir = "Foto Produk"

folder_to_sheet = {
    'ALL NEW ADV ABS 160': 'ADV 160 ABS',
    'ALL NEW ADV ABS 160 ROADSYNCE': 'ADV 160 ABS ROADSYNC',
    'ALL NEW ADV CBS 160': 'ADV 160 CBS',
    'ALL NEW BEAT CBS': 'BEAT SPORTY CBS',
    'ALL NEW BEAT CBS 110': 'BEAT SPORTY CBS',
    'ALL NEW BEAT CBS ISS': 'BEAT SPORTY CBS ISS DELUXE',
    'ALL NEW BEAT SMARTKEY': 'BEAT SPORTY DELUXE SMARTKEY',
    'ALL NEW BEAT STREET': 'BEAT STREET',
    'ALL NEW CB VERZA CW': 'CB 150 VERZA CW',
    'ALL NEW CB VERZA SP': 'CB 150 VERZA SP ',
    'ALL NEW CB150R SE': 'CB150R SE',
    'ALL NEW CB150R STD': 'CB150R STD',
    'ALL NEW CB150X SP': 'CB150X SE',
    'ALL NEW CB150X STD': 'CB150X STD ',
    'ALL NEW CBR 150 ABS BK': 'CBR150R ABS (BK)',
    'ALL NEW CBR 150 ABS RD': 'CBR150R ABS (RD)',
    'ALL NEW CBR 150 STD BK': 'CBR150R STD (BK)',
    'ALL NEW CBR 150 STD MH-RD': 'CBR150R STD (MH)(RD)',
    'ALL NEW CRF 150 L': 'CRF 150',
    'ALL NEW FORZA 250': 'FORZA',
    'ALL NEW GENIO CBS': 'GENIO CBS (BK)',
    'ALL NEW GENIO CBS ISS': 'GENIO CBS ISS',
    'ALL NEW GENIO CBS SP': 'GENIO CBS (BK)',
    'ALL NEW PCX ABS 160': 'PCX 160 ABS',
    'ALL NEW PCX ABS 160 ROADSYNCE': 'PCX 160 ABS ROADSYNC',
    'ALL NEW PCX CBS 160': 'PCX 160 CBS',
    'ALL NEW REVO FIT': 'REVO FIT',
    'ALL NEW REVO X': 'REVO X',
    'ALL NEW SCOOPY FASHION': 'SCOOPY FASHION',
    'ALL NEW SCOOPY STYLISH': 'SCOOPY STYLISH&PRESTIGE',
    'ALL NEW STYLO ABS 160': 'STYLO 160 ABS',
    'ALL NEW STYLO CBS 160': 'STYLO 160 CBS',
    'ALL NEW SUPRA GTR SPORTY': 'NEW SUPRA X GTR 150 SPORTY',
    'ALL NEW SUPRA X 125 SW': 'SUPRA X 125 SPOKE',
    'ALL NEW SUPRA X CW': 'SUPRA X 125 CW',
    'ALL NEW SUPTA GTR EXLUSIVE': 'NEW SUPRA X GTR 150 EXCLUSIVE',
    'ALL NEW VARIO 125 CBS': 'VARIO 125 CBS',
    'ALL NEW VARIO 160 EVO ABS': 'VARIO EVO 160 ABS',
    'ALL NEW VARIO 160 EVO CBS': 'VARIO EVO 160 CBS',
    'ALL NEW VARIO CBS ISS 125': 'VARIO 125 CBS ISS',
    'ALL NEW VARIO STREET 125': 'VARIO 125 STREET',
    'All NEW VARIO 160 EVO CBS NITRO': 'VARIO EVO 160 CBS NITRO'
}

def clean_name(folder):
    words = folder.split()
    cleaned_words = []
    for w in words:
        w_upper = w.upper()
        if w_upper in ["CBS", "ABS", "ISS", "SE", "STD", "EVO", "CBR", "CRF", "PCX", "ADV", "GTR", "CW", "SP", "BK", "RD", "MH-RD"]:
            cleaned_words.append(w_upper)
        else:
            cleaned_words.append(w.capitalize())
    name = " ".join(cleaned_words)
    if name.lower().startswith("all new "):
        name = name[8:]
    return name

def get_category(folder_name):
    f_upper = folder_name.upper()
    if "BEAT" in f_upper:
        return "Beat Series"
    elif "VARIO" in f_upper:
        return "Vario Series"
    elif "GENIO" in f_upper:
        return "Genio Series"
    elif "SCOOPY" in f_upper:
        return "Scoopy Series"
    elif "STYLO" in f_upper:
        return "Stylo Series"
    elif "PCX" in f_upper:
        return "PCX Series"
    elif "ADV" in f_upper:
        return "ADV Series"
    elif "CBR" in f_upper:
        return "Sport Series"
    elif "CB150R" in f_upper or "CB150X" in f_upper or "VERZA" in f_upper:
        return "Sport Series"
    elif "CRF" in f_upper:
        return "Sport Series"
    elif "SUPRA" in f_upper or "SUPTA" in f_upper or "REVO" in f_upper:
        return "Bebek Series"
    elif "FORZA" in f_upper:
        return "Premium Series"
    else:
        return "Lainnya"

folders = [d for d in os.listdir(foto_dir) if os.path.isdir(os.path.join(foto_dir, d))]

products_data = []
xl = pd.ExcelFile(excel_file)
sheet_names_upper = {s.upper().strip(): s for s in xl.sheet_names}

for folder in sorted(folders):
    sheet_name = folder_to_sheet.get(folder)
    if not sheet_name:
        folder_clean = folder.replace("ALL NEW ", "").replace("All NEW ", "").strip().upper()
        for s_upper, s_orig in sheet_names_upper.items():
            if folder_clean in s_upper or s_upper in folder_clean:
                sheet_name = s_orig
                break
                
    if not sheet_name:
        print(f"Warning: could not find sheet mapping for folder '{folder}'")
        continue
        
    try:
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
    except Exception as e:
        print(f"Error reading sheet '{sheet_name}' for folder '{folder}': {e}")
        continue
        
    otr_price = None
    for r in range(min(5, len(df))):
        row_vals = df.iloc[r].tolist()
        for val in row_vals:
            if isinstance(val, (int, float)) and val > 10000000:
                otr_price = float(val)
                break
        if otr_price is not None:
            break
            
    if otr_price is None:
        print(f"Warning: OTR price not found for sheet '{sheet_name}'")
        otr_price = 0.0
        
    tenor_cols = {}
    tenor_row = None
    for r in range(1, 5):
        if r >= len(df):
            break
        row_vals = df.iloc[r].tolist()
        if 11 in row_vals or 11.0 in row_vals:
            tenor_row = r
            break
            
    if tenor_row is None:
        print(f"Warning: tenor row not found for sheet '{sheet_name}'")
        continue
        
    row_vals = df.iloc[tenor_row].tolist()
    tenors = [11, 17, 23, 29, 35]
    for t in tenors:
        for col_idx, val in enumerate(row_vals):
            if isinstance(val, (int, float)) and not pd.isna(val) and int(val) == t:
                tenor_cols[t] = col_idx
                break
                
    installments = []
    for r in range(tenor_row + 1, len(df)):
        row_vals = df.iloc[r].tolist()
        dp_val = row_vals[0]
        if pd.isna(dp_val) or not isinstance(dp_val, (int, float)):
            if len(installments) > 0:
                break
            continue
            
        dp = int(dp_val)
        if dp < 500000:
            continue
            
        rates = {}
        valid = True
        for t in tenors:
            col_idx = tenor_cols.get(t)
            if col_idx is None or col_idx >= len(row_vals):
                valid = False
                break
            rate_val = row_vals[col_idx]
            if pd.isna(rate_val) or not isinstance(rate_val, (int, float)):
                valid = False
                break
            rate = float(rate_val)
            if rate < 10000:
                rate = rate * 1000
            rates[str(t)] = int(rate)
            
        if valid:
            installments.append({
                "dp": dp,
                "rates": rates
            })
            
    folder_path = os.path.join(foto_dir, folder)
    images = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f)) and f.lower().endswith(('.jpeg', '.jpg', '.png'))]
    images = sorted(images)
    
    prod_id = folder.lower().replace(" ", "-")
    prod_name = clean_name(folder)
    category = get_category(folder)
    
    products_data.append({
        "id": prod_id,
        "name": prod_name,
        "folder": folder,
        "category": category,
        "otr_price": otr_price,
        "images": images,
        "installments": installments
    })

with open("products.json", "w", encoding="utf-8") as f:
    json.dump(products_data, f, indent=2, ensure_ascii=False)

print(f"Generated products.json with {len(products_data)} products.")
