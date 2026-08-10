import logging
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings
from app.models.metadata import DatasetMetadata, ColumnMetadata, LineageAsset
from app.datahub.demo_loader import load_demo_datahub_context

logger = logging.getLogger(__name__)

class DataHubClient:
    """
    DataHub GraphQL & REST Client.
    Supports live DataHub GMS instance queries and seamless integration with demo_datahub metadata context.
    """
    def __init__(self, url: Optional[str] = None, token: Optional[str] = None):
        self.url = url or settings.DATAHUB_URL
        self.token = token or settings.DATAHUB_TOKEN
        self.headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        self.is_demo_mode = settings.DEMO_MODE
        self._demo_datasets = load_demo_datahub_context()

    def list_datasets(self) -> List[Dict[str, Any]]:
        if self.is_demo_mode or not self._demo_datasets:
            return [
                {
                    "urn": data["urn"],
                    "name": data["name"],
                    "platform": data["platform"],
                    "description": data["description"],
                    "domain": data.get("domain")
                }
                for data in self._demo_datasets.values()
            ]

        # Live GraphQL query fallback
        graphql_query = """
        query listDatasets {
            search(input: {type: DATASET, query: "*", start: 0, count: 20}) {
                searchResults {
                    entity {
                        ... on Dataset {
                            urn
                            name
                            platform { name }
                        }
                    }
                }
            }
        }
        """
        try:
            with httpx.Client(timeout=5.0) as client:
                res = client.post(f"{self.url}/api/graphql", json={"query": graphql_query}, headers=self.headers)
                if res.status_code == 200:
                    data = res.json()
                    results = data.get("data", {}).get("search", {}).get("searchResults", [])
                    return [
                        {
                            "urn": item["entity"]["urn"],
                            "name": item["entity"].get("name", item["entity"]["urn"]),
                            "platform": item["entity"].get("platform", {}).get("name", "unknown")
                        }
                        for item in results
                    ]
        except Exception as e:
            logger.warning(f"Could not connect to live DataHub GMS ({e}). Falling back to Demo DataHub Context.")

        # Fallback to demo mode
        return [
            {
                "urn": data["urn"],
                "name": data["name"],
                "platform": data["platform"],
                "description": data["description"],
                "domain": data.get("domain")
            }
            for data in self._demo_datasets.values()
        ]

    def get_dataset(self, urn: str) -> DatasetMetadata:
        raw = self._demo_datasets.get(urn)
        if not raw and self._demo_datasets:
            # Match by dataset name if URN differs slightly
            for ds in self._demo_datasets.values():
                if ds["name"] in urn or urn in ds["urn"]:
                    raw = ds
                    break

        if self.is_demo_mode or raw:
            if not raw:
                raw = list(self._demo_datasets.values())[0]

            columns = [ColumnMetadata(**c) for c in raw.get("columns", [])]
            upstream = [LineageAsset(**u) for u in raw.get("upstream", [])]
            downstream = [LineageAsset(**d) for d in raw.get("downstream", [])]

            return DatasetMetadata(
                urn=raw["urn"],
                name=raw["name"],
                platform=raw.get("platform", "postgres"),
                description=raw.get("description"),
                columns=columns,
                upstream=upstream,
                downstream=downstream,
                glossary_terms=raw.get("glossary_terms", []),
                tags=raw.get("tags", []),
                owners=raw.get("owners", []),
                domain=raw.get("domain")
            )

        # Attempt GraphQL query for live dataset
        try:
            with httpx.Client(timeout=5.0) as client:
                query = """
                query getDataset($urn: String!) {
                    dataset(urn: $urn) {
                        urn
                        name
                        platform { name }
                        description
                    }
                }
                """
                res = client.post(
                    f"{self.url}/api/graphql",
                    json={"query": query, "variables": {"urn": urn}},
                    headers=self.headers
                )
                if res.status_code == 200:
                    d = res.json().get("data", {}).get("dataset", {})
                    if d:
                        return DatasetMetadata(
                            urn=d["urn"],
                            name=d.get("name", urn),
                            platform=d.get("platform", {}).get("name", "postgres"),
                            description=d.get("description")
                        )
        except Exception as e:
            logger.warning(f"Error fetching live dataset {urn}: {e}")

        # Fallback to default demo dataset
        raw = list(self._demo_datasets.values())[0]
        return DatasetMetadata(
            urn=raw["urn"],
            name=raw["name"],
            platform=raw.get("platform", "postgres"),
            description=raw.get("description"),
            columns=[ColumnMetadata(**c) for c in raw["columns"]],
            upstream=[LineageAsset(**u) for u in raw["upstream"]],
            downstream=[LineageAsset(**d) for d in raw["downstream"]],
            glossary_terms=raw.get("glossary_terms", []),
            tags=raw.get("tags", []),
            owners=raw.get("owners", []),
            domain=raw.get("domain")
        )
