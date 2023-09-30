import requests

from xml.etree import ElementTree as ET

def get_access_token(token_url, payload):
    response = requests.post(token_url, data=payload)
    #TODO:json error
    return response.json().get("access_token")

def get_files(access_token, file_url):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.request("PROPFIND", file_url, headers=headers)

    if response.status_code != 207:
        return "Fehler beim Abrufen der Dateien", 500

    root = ET.fromstring(response.content)
    return [
        elem.text for elem in root.findall(".//{DAV:}href") if elem.text[-1] != "/"
    ]

def download_file(access_token, auth_url, file):
    download_url = f"{auth_url}{file}"

    return requests.get(
        download_url, headers={"Authorization": f"Bearer {access_token}"}
    )