import requests
import urllib

def submit_search_query():
    # Base URI of the search endpoint
    # base_uri = "https://search.rcsb.org/rcsbsearch/v2/query"

    # Define the search query
    # search_query = {
    #     "query": {
    #         "type": "group",
    #         "nodes": [
    #         {
    #             "type": "terminal",
    #             "service": "text",
    #             "parameters": {
    #             "attribute": "rcsb_entry_info.structure_determination_methodology",
    #             "operator": "exact_match",
    #             "value": "experimental"
    #             }
    #         },
    #         {
    #             "type": "terminal",
    #             "service": "text",
    #             "parameters": {
    #             "attribute": "entity_poly.rcsb_entity_polymer_type",
    #             "value": "Protein",
    #             "operator": "exact_match"
    #             }
    #         }
    #         ],
    #         "logical_operator": "and",
    #         "label": "text"
    #     },
    #     "return_type": "entry",
    #     "request_options": {
    #         "results_verbosity": "compact",
    #         "scoring_strategy": "combined",
    #         "results_content_type": [
    #         "experimental"
    #         ],
    #         "paginate": {
    #         "start": 0,
    #         "rows": 100
    #         },
    #         "sort": [
    #         {
    #             "sort_by": "score",
    #             "direction": "desc"
    #         }
    #         ]
    #     }
    # }
    # Convert the query to JSON
    # json_payload = {"json": search_query}
    # query_encoded = urllib.parse.urlencode(json_payload)
    # full_url = base_uri + "?" + query_encoded
    # test = "https://search.rcsb.org/rcsbsearch/v2/query?json=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22rcsb_entry_info.structure_determination_methodology%22%2C%22operator%22%3A%22exact_match%22%2C%22value%22%3A%22experimental%22%7D%7D%2C%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22entity_poly.rcsb_entity_polymer_type%22%2C%22value%22%3A%22Protein%22%2C%22operator%22%3A%22exact_match%22%7D%7D%5D%2C%22logical_operator%22%3A%22and%22%2C%22label%22%3A%22text%22%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22results_verbosity%22%3A%22compact%22%2C%22scoring_strategy%22%3A%22combined%22%2C%22results_content_type%22%3A%5B%22experimental%22%5D%2C%22paginate%22%3A%7B%22start%22%3A0%2C%22rows%22%3A100%7D%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D"
    url_base = "https://search.rcsb.org/rcsbsearch/v2/query?json=%7B%22query%22%3A%7B%22type%22%3A%22group%22%2C%22nodes%22%3A%5B%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22rcsb_entry_info.structure_determination_methodology%22%2C%22operator%22%3A%22exact_match%22%2C%22value%22%3A%22experimental%22%7D%7D%2C%7B%22type%22%3A%22terminal%22%2C%22service%22%3A%22text%22%2C%22parameters%22%3A%7B%22attribute%22%3A%22entity_poly.rcsb_entity_polymer_type%22%2C%22value%22%3A%22Protein%22%2C%22operator%22%3A%22exact_match%22%7D%7D%5D%2C%22logical_operator%22%3A%22and%22%2C%22label%22%3A%22text%22%7D%2C%22return_type%22%3A%22entry%22%2C%22request_options%22%3A%7B%22results_verbosity%22%3A%22compact%22%2C%22scoring_strategy%22%3A%22combined%22%2C%22results_content_type%22%3A%5B%22experimental%22%5D%2C%22paginate%22%3A%7B%22start%22%3A{start}%2C%22rows%22%3A{row}%7D%2C%22sort%22%3A%5B%7B%22sort_by%22%3A%22score%22%2C%22direction%22%3A%22desc%22%7D%5D%7D%7D"
    
    total = 210000
    # total = 20
    # step = 10
    step = 10000
    all_pdbs = []
    for i in range(0, total, step):
        url =url_base.format(start=i, row=step)
        response = requests.get(url)
        if response.status_code == 200:
            # Print the response content (you may want to handle it accordingly)
            data = response.json()['result_set']
            all_pdbs.extend(data)
            # print(response.json())
        else:
            print(f"Error: {response.status_code}, {response.text}")
    
    with open("pdbIds.tsx", 'w') as file:
        file.write("const options = [")

        for pdb in all_pdbs:
            file.write("{ value: '" + pdb + "', label: '" + pdb + "' },\n")

        file.write("]")


# Call the function to submit the search query
submit_search_query()