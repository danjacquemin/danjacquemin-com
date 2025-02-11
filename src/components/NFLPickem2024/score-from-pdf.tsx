import { useState } from "react";
import pdfToText from "react-pdftotext";

const PickemPDFExtract = (): JSX.Element => {
  const [pdfText, setPdfText] = useState("");

  const handleFileChange = async (e) => {
    console.log("yo");
    const file = e.target.files[0];
    pdfToText(file)
      .then((text) => setPdfText(text))
      .catch((error) => console.error("Failed to extract text from pdf"));
  };

  return (
    <>
      <section className="min-w-[700px] basis-1/2">
        <h1 className="mb-6 italic">PDF Extract</h1>
      </section>
      <hr className="-mx-4 mb-4" />
      <div className="flex">
        <section className="min-w-[700px] basis-1/2">
          <h2>File to Extract From&hellip;</h2>
          <div className="px-4 pb-6">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </div>
        </section>
        <section className="min-w-[700px] basis-1/2">
          <h2>Extracted Data</h2>
          <div className="px-4 pb-6">
            <p>PDF data goes here.</p>
            <textarea value={pdfText} rows={10} cols={80} readOnly />
          </div>
        </section>
      </div>
    </>
  );
};

export default PickemPDFExtract;
