import "./ModelDetail.css";

import { AIModel } from "../../types";
import { DetailItem, SectionTitle } from "@/ui";

/** Zobrazuje detailní informace o modelu. */
function ModelDetail({ model }: { model: AIModel }) {
    return (
        <article className="model-detail">
            <div className="model-detail__cover">
                <img
                    src={model.image}
                    alt={model.name}
                />
            </div>

            <div className="model-detail__info">
                <header>
                    <h2>{model.name}</h2>
                    <p className="author">{model.author}</p>
                    <p className="price">{model.price} Kč,-</p>
                </header>

                <div className="model-detail__details">
                    <DetailItem label="Stav" value={model.state} />
                    <DetailItem label="Parametrů (mld.)" value={model.pages} />
                    <DetailItem label="Nasazení" value={`${model.delivery} Kč`} />
                </div>

                <section>
                    <SectionTitle>Popis</SectionTitle>
                    <p>{model.description}</p>
                </section>

                <section>
                    <SectionTitle>Prodejce</SectionTitle>
                    <p className="seller">{model.fname} {model.lname}</p>
                    <p className="phone">{model.phone}</p>
                </section>
            </div>
        </article>
    );
}

export default ModelDetail;