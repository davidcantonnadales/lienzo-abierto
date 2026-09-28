"use client";
import { useEffect, useRef, useState } from "react";
import { catalog, type Artwork } from "@/lib/catalog";
import {
  readImages,
  saveImage,
  deleteImage,
  fileToImage,
} from "@/lib/local-gallery";
export default function Gallery() {
  const [local, setLocal] = useState<Artwork[]>([]),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("Todas"),
    [favorites, setFavorites] = useState<string[]>([]),
    [onlyFavorites, setOnlyFavorites] = useState(false),
    [sort, setSort] = useState("recent"),
    [selected, setSelected] = useState<Artwork | null>(null),
    [upload, setUpload] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    formDialog = useRef<HTMLDialogElement>(null),
    lastFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    readImages()
      .then(setLocal)
      .catch(() =>
        setMessage(
          "Tu navegador no permite guardar imágenes locales. Puedes explorar las del catálogo.",
        ),
      );
    try {
      const v = JSON.parse(localStorage.getItem("lienzo-favorites") || "[]");
      if (Array.isArray(v) && v.every((x) => typeof x === "string"))
        setFavorites(v);
    } catch {}
  }, []);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);
  useEffect(() => {
    if (upload) formDialog.current?.showModal();
    else formDialog.current?.close();
  }, [upload]);
  const items = [...catalog, ...local]
    .filter(
      (i) =>
        (category === "Todas" || i.category === category) &&
        (!onlyFavorites || favorites.includes(i.id)) &&
        `${i.title} ${i.description}`
          .toLocaleLowerCase("es")
          .includes(query.toLocaleLowerCase("es")),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title, "es")
        : b.created - a.created,
    );
  function favorite(id: string) {
    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    setFavorites(next);
    try {
      localStorage.setItem("lienzo-favorites", JSON.stringify(next));
    } catch {
      setMessage(
        "Favorito marcado en esta sesión; el navegador bloquea su guardado.",
      );
    }
  }
  function close() {
    setSelected(null);
    lastFocus.current?.focus();
  }
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget,
      data = new FormData(form),
      file = data.get("image") as File;
    try {
      if (local.length >= 20)
        throw new Error(
          "Puedes guardar hasta 20 imágenes locales. Borra una antes de añadir otra.",
        );
      const title = String(data.get("title") || "").trim();
      if (!title || title.length > 80)
        throw new Error("Escribe un título de entre 1 y 80 caracteres.");
      const art: Artwork = {
        id: crypto.randomUUID(),
        title,
        category: String(data.get("category")),
        description:
          "Imagen añadida por ti. Solo se conserva en este navegador.",
        src: await fileToImage(file),
        local: true,
        created: Date.now(),
      };
      await saveImage(art);
      setLocal((prev) => [...prev, art]);
      setUpload(false);
      setCategory("Todas");
      setOnlyFavorites(false);
      setQuery("");
      setMessage("Imagen añadida. No se ha enviado a ningún servidor.");
      form.reset();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "No se pudo guardar la imagen. Puede faltar espacio.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function remove(art: Artwork) {
    try {
      await deleteImage(art.id);
      setLocal((prev) => prev.filter((i) => i.id !== art.id));
      if (favorites.includes(art.id)) favorite(art.id);
      close();
      setMessage("Imagen local eliminada.");
    } catch {
      setMessage("No se pudo eliminar la imagen. Inténtalo de nuevo.");
    }
  }
  return (
    <>
      <a className="skip" href="#coleccion">
        Ir a la colección
      </a>
      <header className="header wrap">
        <a className="brand" href="/">
          <img src="/logo.svg" width="42" height="42" alt="" />
          Lienzo<span>Abierto</span>
        </a>
        <nav aria-label="Principal">
          <a href="#coleccion">La colección</a>
          <button
            className="text-button"
            onClick={() => {
              setOnlyFavorites((v) => !v);
              document.getElementById("coleccion")?.scrollIntoView();
            }}
            aria-pressed={onlyFavorites}
          >
            ♡ Favoritas <span>{favorites.length}</span>
          </button>
          <button
            className="button small"
            onClick={() => {
              setMessage("");
              setUpload(true);
            }}
          >
            + Añadir imagen
          </button>
        </nav>
      </header>
      <main>
        <section className="hero wrap">
          <div>
            <p className="eyebrow">
              UNA GALERÍA PARA LAS IDEAS QUE MERECEN QUEDARSE
            </p>
            <h1>
              Un lugar para
              <br />
              mirar <em>despacio.</em>
            </h1>
            <p className="intro">
              Paisajes que invitan a perderse. Mundos que todavía no existen.
              Encuentra una imagen, guarda una idea y haz tuya la colección.
            </p>
            <a className="hero-link" href="#coleccion">
              Explorar la colección <span>↘</span>
            </a>
            <div className="hero-note">
              <span className="dot" /> Imágenes originales · Código abierto ·
              Sin cuentas
            </div>
          </div>
          <figure className="hero-art">
            <img
              src="/art/faro.webp"
              alt="Ilustración de un faro en una isla coral entre olas turquesas"
            />
            <figcaption>
              <span>01 / DONDE EMPIEZA EL MAR</span>
              <span>Ilustración con IA ↗</span>
            </figcaption>
          </figure>
        </section>
        <section className="collection wrap" id="coleccion">
          <div className="section-title">
            <div>
              <p className="eyebrow">TU PEQUEÑO MUSEO PERSONAL</p>
              <h2>
                La colección<span>.</span>
              </h2>
            </div>
            <p>{items.length} imágenes para descubrir</p>
          </div>
          <div className="toolbar">
            <div className="filters" role="group" aria-label="Categoría">
              {["Todas", "Naturaleza", "Imaginación", "Arquitectura"].map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                  >
                    {c}
                  </button>
                ),
              )}
            </div>
            <label className="search">
              <span className="sr-only">Buscar imágenes</span>
              <input
                type="search"
                placeholder="Busca una idea…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="sr-only" htmlFor="sort">
              Ordenar
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recent">Más recientes</option>
              <option value="title">Por título</option>
            </select>
          </div>
          {onlyFavorites && (
            <div className="favorite-filter">
              Viendo tus favoritas{" "}
              <button onClick={() => setOnlyFavorites(false)}>
                Ver todas ×
              </button>
            </div>
          )}
          <p className="status" role="status">
            {!upload && message}
          </p>
          <div className="grid">
            {items.map((art, n) => (
              <article className="art-card" key={art.id}>
                <button
                  className="image-open"
                  onClick={(e) => {
                    lastFocus.current = e.currentTarget;
                    setSelected(art);
                  }}
                  aria-label={"Abrir " + art.title}
                >
                  <img
                    src={art.src}
                    alt={art.title}
                    loading={n < 2 ? "eager" : "lazy"}
                  />
                  <span className="image-label">
                    {art.local ? "Tu imagen" : art.category}
                  </span>
                  <span className="expand" aria-hidden="true">
                    ↗
                  </span>
                </button>
                <div className="art-info">
                  <div>
                    <h3>{art.title}</h3>
                    <p>
                      {art.local
                        ? "Solo en este navegador"
                        : "Ilustración original · IA"}
                    </p>
                  </div>
                  <button
                    className="heart"
                    onClick={() => favorite(art.id)}
                    aria-pressed={favorites.includes(art.id)}
                    aria-label={
                      (favorites.includes(art.id)
                        ? "Quitar de favoritas: "
                        : "Guardar favorita: ") + art.title
                    }
                  >
                    {favorites.includes(art.id) ? "♥" : "♡"}
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!items.length && (
            <div className="empty">
              <h3>Aquí cabe tu próxima idea.</h3>
              <p>Prueba otra búsqueda o añade una imagen a tus favoritas.</p>
              <button
                className="button"
                onClick={() => {
                  setQuery("");
                  setCategory("Todas");
                  setOnlyFavorites(false);
                }}
              >
                Ver toda la colección
              </button>
            </div>
          )}
        </section>
        <section className="closing wrap">
          <span className="eyebrow">ABIERTO POR DENTRO Y POR FUERA</span>
          <h2>
            Guarda lo que te inspira.
            <br />
            Construye algo tuyo.
          </h2>
          <p>
            Tus favoritos y las imágenes que añades se quedan en este navegador.
            No hay cuenta, publicidad ni envío de tus archivos. Si borras los
            datos del sitio, se pierden: descarga lo que quieras conservar.
          </p>
          <a href="https://github.com/davidcantonnadales/lienzo-abierto">
            Explorar el código en GitHub ↗
          </a>
        </section>
      </main>
      <footer className="wrap footer">
        <span>Lienzo Abierto · Un proyecto de David Cantón</span>
        <span>Código MIT · Arte de ejemplo generado con IA</span>
      </footer>
      <dialog
        ref={dialog}
        onCancel={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        aria-label={selected?.title}
      >
        <div className="lightbox">
          {selected && (
            <>
              <button
                className="close"
                onClick={close}
                aria-label="Cerrar imagen"
              >
                ×
              </button>
              <img
                className="full-art"
                src={selected.src}
                alt={selected.title}
              />
              <div className="lightbox-info">
                <p className="eyebrow">{selected.category}</p>
                <h2>{selected.title}</h2>
                <p>{selected.description}</p>
                <div className="actions">
                  <a
                    className="button"
                    href={selected.src}
                    download={
                      selected.local ? "mi-imagen.webp" : selected.id + ".webp"
                    }
                  >
                    Descargar imagen ↓
                  </a>
                  <button
                    className="button secondary"
                    onClick={() => favorite(selected.id)}
                  >
                    {favorites.includes(selected.id)
                      ? "♥ Guardada"
                      : "♡ Guardar favorita"}
                  </button>
                  {selected.local && (
                    <button
                      className="text-button"
                      onClick={() => void remove(selected)}
                    >
                      Eliminar de este navegador
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </dialog>
      <dialog
        ref={formDialog}
        onCancel={() => setUpload(false)}
        aria-labelledby="upload-title"
      >
        <form className="upload-form" onSubmit={add}>
          <button
            type="button"
            className="close"
            onClick={() => setUpload(false)}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
          <p className="eyebrow">UN HUECO PARA TU MIRADA</p>
          <h2 id="upload-title">Añade una imagen.</h2>
          <p>
            JPG, PNG o WebP de hasta 10 MB. Se guarda solo en este navegador.
            Usa imágenes propias o que tengas permiso para utilizar.
          </p>
          <label>
            Título
            <input
              name="title"
              required
              maxLength={80}
              placeholder="Ponle un nombre"
            />
          </label>
          <label>
            Categoría
            <select name="category">
              <option>Naturaleza</option>
              <option>Imaginación</option>
              <option>Arquitectura</option>
            </select>
          </label>
          <label>
            Imagen
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
            />
          </label>
          <p className="status" role="status">
            {message}
          </p>
          <button className="button" disabled={busy}>
            {busy ? "Guardando…" : "Añadir a mi colección"}
          </button>
        </form>
      </dialog>
    </>
  );
}
