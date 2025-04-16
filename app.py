from flask import Flask, render_template, request, jsonify
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain_chroma import Chroma
from models import Models

# Initialize Flask app
app = Flask(__name__)

# Initialize the models
models = Models()
embeddings = models.embeddings_ollama
llm = models.model_ollama

print(f"Embeddings: {embeddings}")
print(f"LLM: {llm}")


# Initialize the vector store
vector_store = Chroma(
    collection_name="documents",
    embedding_function=embeddings,
    persist_directory="./db/chroma_langchain_db",
)

# Define the chat prompt
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant. Answer the question based only on the data provided."),
        ("human", "Use the user question {input} to answer the question. Use only the {context} to answer the question.")
    ]
)

# Define the retrieval chain
retriever = vector_store.as_retriever(kwargs={"k": 10})
combine_docs_chain = create_stuff_documents_chain(
    llm, prompt
)
retrieval_chain = create_retrieval_chain(retriever, combine_docs_chain)

# Route for the chatbot interface
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        query = data.get("query", "")

        if not query:
            return jsonify({"error": "No query provided"}), 400

        # Retrieve relevant documents
        retrieved_docs = retriever.invoke(query)
        context = "\n".join([doc.page_content for doc in retrieved_docs])

        print(f"Retrieved Context: {context}")  # Log the retrieved documents

        # Get response from the retrieval chain
        result = retrieval_chain.invoke({"context": context, "input": query})

        answer = result.get("answer", "I'm sorry, I couldn't find an answer.")

        return jsonify({"answer": answer})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
