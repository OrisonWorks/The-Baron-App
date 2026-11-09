from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.worksheet.datavalidation import DataValidation

wb = Workbook()
ws = wb.active
ws.title = "STOCK"
headers = ["SKU","NAME","BRAND","CATEGORY","TYPE","FOR","VARIANT","PRICE (K)","STOCK","CONDITION","WARRANTY","PHOTO","DESCRIPTION"]
widths  = [12,30,14,18,16,10,22,11,8,12,12,30,45]
ws.append(headers)
for i,(h,w) in enumerate(zip(headers,widths),1):
    c = ws.cell(row=1,column=i); c.font=Font(bold=True,color="FFFFFF"); c.fill=PatternFill("solid",fgColor="111111"); c.alignment=Alignment(horizontal="center")
    ws.column_dimensions[c.column_letter].width=w
ws.freeze_panes="A2"
examples = [
 ["PH-001","Samsung Galaxy A15","Samsung","Phones","Smartphone","","128GB / Black",3200,4,"New","6 months","","EXAMPLE ROW - delete me. 6.5\" display, dual SIM"],
 ["PH-001","Samsung Galaxy A15","Samsung","Phones","Smartphone","","128GB / Blue",3200,2,"New","6 months","","EXAMPLE ROW - same SKU, another variant"],
 ["HP-001","JBL Tune 520BT","JBL","Headphones","Over-ear","","White",950,3,"New","3 months","","EXAMPLE ROW"],
 ["EP-001","Oraimo FreePods 4","Oraimo","Earphones","Wireless earbuds","","Black",650,6,"New","3 months","","EXAMPLE ROW"],
 ["AC-001","Fast charger 25W USB-C","Samsung","Phone Accessories","Charger","","25W",250,10,"New","","","EXAMPLE ROW"],
 ["AC-002","Silicone phone cover","Generic","Phone Accessories","Phone cover","","iPhone 13 / Black",120,8,"New","","","EXAMPLE ROW"],
 ["WT-001","Fossil Grant Chronograph","Fossil","Watches","Premium","Men","Brown leather",3500,1,"New","1 year","","EXAMPLE ROW"],
 ["WT-002","Casio MTP-V002","Casio","Watches","Affordable","Men","Silver",450,5,"New","","","EXAMPLE ROW"],
 ["BC-001","Nivea Cocoa Butter Lotion","Nivea","Body Care","Lotion","Women","400ml",180,12,"New","","","EXAMPLE ROW"],
 ["CL-001","Plain crew-neck T-shirt","Generic","Clothing","T-shirt","Men","M / Black",200,5,"New","","","EXAMPLE ROW"],
]
for r in examples: ws.append(r)
for row in ws.iter_rows(min_row=2,max_row=len(examples)+1):
    for c in row: c.fill=PatternFill("solid",fgColor="FFF4CC")

lists = wb.create_sheet("LISTS")
cats = ["Phones","Headphones","Earphones","Phone Accessories","Watches","Body Care","Clothing"]
fors = ["Men","Women","Unisex"]
conds = ["New","Ex-UK / Used","Refurbished"]
for i,v in enumerate(cats,1): lists.cell(row=i,column=1,value=v)
for i,v in enumerate(fors,1): lists.cell(row=i,column=2,value=v)
for i,v in enumerate(conds,1): lists.cell(row=i,column=3,value=v)
lists.sheet_state="hidden"
for col,ref in (("D",f"LISTS!$A$1:$A${len(cats)}"),("F",f"LISTS!$B$1:$B${len(fors)}"),("J",f"LISTS!$C$1:$C${len(conds)}")):
    dv=DataValidation(type="list",formula1=ref,allow_blank=True); ws.add_data_validation(dv); dv.add(f"{col}2:{col}2000")
for col in ("H","I"):
    dv=DataValidation(type="whole",operator="greaterThanOrEqual",formula1="0",allow_blank=True,error="Whole numbers only",showErrorMessage=True); ws.add_data_validation(dv); dv.add(f"{col}2:{col}2000")

ins = wb.create_sheet("HOW TO FILL",0)
ins.column_dimensions["A"].width=20; ins.column_dimensions["B"].width=95
rows = [
 ("The Baron - stock sheet",""),
 ("",""),
 ("One row per variant","Each colour / storage / size you stock gets its own row. Rows of the same product share the same SKU."),
 ("SKU","Your own short code, e.g. PH-001. Never shown to customers."),
 ("NAME","Product name as customers should see it."),
 ("BRAND","Samsung, JBL, Fossil, Casio, Nivea ... (used for the brand filter)."),
 ("CATEGORY","Pick from the dropdown: Phones, Headphones, Earphones, Phone Accessories, Watches, Body Care, Clothing."),
 ("TYPE","Free text sub-group: Charger, Cable, Phone cover, Premium / Affordable (watches), Lotion, Serum, Body wash, Face mask ..."),
 ("FOR","Men / Women / Unisex - mainly for watches, body care and clothing. Leave blank for phones and gadgets."),
 ("VARIANT","What makes this row different: '128GB / Black', 'Silver', '400ml', 'M / Black'."),
 ("PRICE (K)","Selling price in Kwacha, whole number, no 'K'."),
 ("STOCK","How many you have of this exact variant. 0 = sold out (the shop shows 'Sold out', never the number)."),
 ("CONDITION","New / Ex-UK / Used / Refurbished."),
 ("WARRANTY","Optional, e.g. '6 months'."),
 ("PHOTO","Optional for now. Paste an image link, or send photos on WhatsApp named with the SKU (PH-001.jpg) and we will upload them."),
 ("DESCRIPTION","Short selling points / specs."),
 ("",""),
 ("Yellow rows","Examples only - delete them before going live."),
 ("Google Sheets","Upload this file to Google Drive and open it with Google Sheets so the website can read it live."),
]
for r in rows: ins.append(r)
ins["A1"].font=Font(bold=True,size=14)
for r in range(3,len(rows)+1): ins.cell(row=r,column=1).font=Font(bold=True)
for r in range(1,len(rows)+1): ins.cell(row=r,column=2).alignment=Alignment(wrap_text=True,vertical="top")
wb.save("docs/The-Baron-stock-sheet-template.xlsx")
