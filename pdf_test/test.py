from langchain.document_loaders import PyPDFLoader

loader = PyPDFLoader("./policy.pdf")
documents = loader.load_and_split()

from langchain.text_splitter import CharacterTextSplitter

text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

import pinecone
from langchain.embeddings.openai import OpenAIEmbeddings

pinecone.init(
    api_key="", #api keyのセット
    environment="us-west4-gcp-free"
)

index_name = "pdf-example"

# dimensionは、Embedding時の次元数になり、OpenAIのadaを使う際は1536になります。
pinecone.create_index(index_name, dimension=1536, metric="euclidean", pod_type="p1")

from langchain.vectorstores import Pinecone

embeddings = OpenAIEmbeddings()
embedd_docs_result = Pinecone.from_documents(docs, embeddings, index_name=index_name)
