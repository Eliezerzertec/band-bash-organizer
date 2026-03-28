#!/usr/bin/env python3
"""
Deploy Supabase Edge Function via REST API
Requires: SUPABASE_ACCESS_TOKEN environment variable
"""

import os
import json
import sys
import requests
from pathlib import Path

PROJECT_ID = "buavxdpzdckkhtzdggnq"
FUNCTION_NAME = "create-user"
FUNCTION_PATH = Path(__file__).parent / "supabase" / "functions" / FUNCTION_NAME / "index.ts"

def main():
    # Get access token from environment
    access_token = os.getenv("SUPABASE_ACCESS_TOKEN")
    if not access_token:
        print("❌ SUPABASE_ACCESS_TOKEN não configurado!")
        print("Como obter o token:")
        print("1. Acesse https://app.supabase.com")
        print("2. Vá em Account > Access Tokens")
        print("3. Crie um novo token")
        print("4. Execute: set SUPABASE_ACCESS_TOKEN=seu_token_aqui")
        return False

    if not FUNCTION_PATH.exists():
        print(f"❌ Arquivo da função não encontrado: {FUNCTION_PATH}")
        return False

    # Read function code
    with open(FUNCTION_PATH, 'r') as f:
        function_code = f.read()

    print(f"📦 Deployando função: {FUNCTION_NAME}")
    print(f"📂 Projeto: {PROJECT_ID}")

    # Deploy via API
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": FUNCTION_NAME,
        "slug": FUNCTION_NAME,
        "source_code": function_code,
    }

    url = f"https://api.supabase.com/v1/projects/{PROJECT_ID}/functions"
    
    print(f"🚀 Enviando requisição para: {url}")
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        if response.status_code in [200, 201]:
            print("✅ Função deployada com sucesso!")
            print(json.dumps(response.json(), indent=2))
            return True
        elif response.status_code == 409:
            # Function already exists, try to update
            print("⚠️ Função já existe. Tentando atualizar...")
            response = requests.put(url + f"/{FUNCTION_NAME}", json=payload, headers=headers)
            if response.status_code in [200, 201]:
                print("✅ Função atualizada com sucesso!")
                print(json.dumps(response.json(), indent=2))
                return True
        
        print(f"❌ Erro ao fazer deploy: HTTP {response.status_code}")
        print(response.text)
        return False
        
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
