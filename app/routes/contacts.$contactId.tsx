import { Form, json, useFetcher, useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";

import { getContact, type ContactRecord, updateContact } from "../data"
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";

export const loader = async ({
  params,
}: LoaderFunctionArgs) => {
  // if there's no contact id in the url
  invariant(params.contactId, "Missing contact id url param")

  const contact = await getContact(params.contactId)

  // if the contact is not found
  if (!contact) {
    throw new Response("Contact not found", { status: 404 })
  }

  return json({ contact })
}

export const action = async ({
  params,
  request
}: ActionFunctionArgs) => {
  invariant(params.contactId, "There is no contact id")
  const formData = await request.formData()
  return updateContact(params.contactId, {
    favorite: formData.get("favorite") === "true"
  })
}

export default function Contact() {
  const { contact } = useLoaderData<typeof loader>()

  return (
    <div id="contact">
      <div>
        {contact.avatar ? (
          <img
            alt={`${contact.first} ${contact.last} avatar`}
            key={contact.avatar}
            src={contact.avatar}
          />
        ) : (
          <img
            alt={`${contact.first} ${contact.last} avatar`}
            key={contact.last}
            src={"https://api.dicebear.com/7.x/initials/svg?seed=" + contact.first + contact.last}
          />
        )}
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={event => {
              const response = confirm("Please confirm that you want to delete this contact")
              if (!response) event.preventDefault()
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{ contact: Pick<ContactRecord, "favorite"> }> = ({ contact }) => {
  const fetcher = useFetcher()
  const favorite = fetcher.formData ? fetcher.formData.get("favorite") === "true" : contact.favorite

  return (
    <fetcher.Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >{favorite ? "★" : "☆"}</button>
    </fetcher.Form>
  )
}