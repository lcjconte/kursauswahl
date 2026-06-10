# kursauswahl
Simple web app allowing students to select their subjects online.

Previously students would fill out a paper form, only to find out that their selection was actually invalid.
With this app they can (1) Try out different combinations (2) Register their selection.
Courses, rules and interface are customizable. 

## Before deploying:  
- Apply selections.sql and userdata.sql to postgres db  
- Set DATABASE_URL env variable to your postgres db url  
- Customize subjects and their names in /public/subjects.json 
- Customize subject selection rules in /public/ruleset.json  
- Customize selection table in /public/table.json
