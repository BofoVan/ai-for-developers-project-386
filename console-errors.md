Total messages: 5 (Errors: 2, Warnings: 0)
Returning 2 messages for level "error"

[ERROR] In HTML, %s cannot be a descendant of <%s>.
This will cause a hydration error.%s <button> button 

  ...
    <Table>
      <div data-slot="table-cont..." className="relative w...">
        <table data-slot="table" className="w-full cap...">
          <TableHeader>
          <TableBody>
            <tbody data-slot="table-body" className={"[&_tr:la..."}>
              <TableRow>
                <tr data-slot="table-row" className="border-b t...">
                  <TableCell>
                  <TableCell>
                  <TableCell>
                  <TableCell>
                  <TableCell>
                    <td data-slot="table-cell" className={"p-2 alig..."}>
                      <AlertDialog>
                        <AlertDialogRoot data-slot="alert-dialog">
                          <AlertDialogTrigger>
                            <DialogTrigger data-slot="alert-dial...">
>                             <button
>                               type="button"
>                               onClick={function}
>                               onMouseDown={function}
>                               onKeyDown={function}
>                               onKeyUp={function}
>                               onPointerDown={function}
>                               tabIndex={0}
>                               disabled={false}
>                               data-base-ui-click-trigger=""
>                               id="base-ui-_r_3_"
>                               aria-haspopup="dialog"
>                               aria-expanded={false}
>                               aria-controls={undefined}
>                               data-slot="alert-dialog-trigger"
>                               ref={function}
>                             >
                                <Button variant="ghost" size="icon" className="text-destr...">
                                  <Button data-slot="button" className={"group/bu..."}>
>                                   <button
>                                     type="button"
>                                     onClick={function}
>                                     onMouseDown={function}
>                                     onKeyDown={function}
>                                     onKeyUp={function}
>                                     onPointerDown={function}
>                                     tabIndex={0}
>                                     disabled={false}
>                                     data-slot="button"
>                                     ref={function}
>                                     className={"group/button inline-flex shrink-0 items-center justify-center round..."}
>                                   >
                          ...
 @ http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=36b8b407:1770
[ERROR] <%s> cannot contain a nested %s.
See this log for the ancestor stack trace. button <button> @ http://localhost:5173/node_modules/.vite/deps/react-dom_client.js?v=36b8b407:1772