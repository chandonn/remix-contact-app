import { ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteContact } from "~/data";

export const action = async ({
  params
}: ActionFunctionArgs) => {
  invariant(params.contactId, "There is no contact id")
  await deleteContact(params.contactId)

  return redirect("/")
}