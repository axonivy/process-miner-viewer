import { InscriptionClientJsonRpc, IvyScriptLanguage } from '@axonivy/inscription-core';
import { ClientContextProvider, MonacoEditorUtil, initQueryClient } from '@axonivy/inscription-editor';
import { InscriptionContext } from '@axonivy/inscription-protocol';
import { JumpAction, MoveIntoViewportAction, SwitchThemeAction } from '@axonivy/process-editor-protocol';
import {
  Action,
  GArgument,
  GLSPAbstractUIExtension,
  GLSPActionDispatcher,
  GModelRoot,
  IActionHandler,
  ISelectionListener,
  SelectAction,
  SelectAllAction,
  SelectionService,
  isNotUndefined,
  isOpenable
} from '@eclipse-glsp/client';
import { webSocketConnection, type Connection } from '@axonivy/jsonrpc';
import type { MonacoLanguageClient } from 'monaco-languageclient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { inject, injectable, postConstruct } from 'inversify';
import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { OpenAction } from 'sprotty-protocol';
import InscriptionView from './InscriptionView';
import { EnableInscriptionAction, ToggleInscriptionAction } from './action';

const JSX = { createElement: React.createElement };

@injectable()
export class InscriptionUi extends GLSPAbstractUIExtension implements IActionHandler, ISelectionListener {
  static readonly ID = 'inscription-ui';

  @inject(SelectionService) protected readonly selectionService: SelectionService;
  @inject(GLSPActionDispatcher) protected readonly actionDispatcher: GLSPActionDispatcher;

  private inscriptionElement?: string;
  private action?: EnableInscriptionAction;
  private inscriptionContext: InscriptionContext;
  private root: Root;
  private inscriptionClient?: Promise<InscriptionClientJsonRpc>;
  private queryClient: QueryClient;

  public id(): string {
    return InscriptionUi.ID;
  }

  @postConstruct()
  protected init(): void {
    this.selectionService.onSelectionChanged(event => this.selectionChanged(event.root, event.selectedElements));
  }

  public containerClass(): string {
    return 'inscription-ui-container';
  }

  protected initializeContents(containerElement: HTMLElement) {
    this.changeUiVisiblitiy(false);
    this.inscriptionContext = this.initInscriptionContext();
    this.queryClient = initQueryClient();
    this.inscriptionClient = this.startInscriptionClient();
    this.root = createRoot(containerElement);
  }

  private updateInscriptionUi() {
    if (!this.inscriptionElement) {
      return;
    }
    const element = this.inscriptionElement;
    this.inscriptionClient?.then(client => {
      this.root.render(
        <React.StrictMode>
          <ClientContextProvider client={client}>
            <QueryClientProvider client={this.queryClient}>
              <InscriptionView
                app={this.inscriptionContext.app}
                pmv={this.inscriptionContext.pmv}
                pid={element}
                outline={{
                  selection: this.selectionService.getSelectedElementIDs()[0],
                  onClick: id => this.selectFromOutline(id)
                }}
              />
            </QueryClientProvider>
          </ClientContextProvider>
        </React.StrictMode>
      );
    });
  }

  async startInscriptionClient(): Promise<InscriptionClientJsonRpc> {
    const model = this.selectionService.getModelRoot();
    const webSocketAddress = this.action?.connection?.server ?? GArgument.getString(model, 'webSocket') ?? 'ws://localhost:8081/';
    if (this.action?.connection?.ivyScript) {
      IvyScriptLanguage.startClient(this.action?.connection?.ivyScript, MonacoEditorUtil.getInstance());
    } else {
      this.startIvyScriptWebSocketClient(webSocketAddress);
    }
    if (this.action?.connection?.inscription) {
      return InscriptionClientJsonRpc.startClient(this.action.connection.inscription);
    }
    return this.startInscriptionWebSocketClient(webSocketAddress);
  }

  private async startIvyScriptWebSocketClient(webSocketAddress: string) {
    const initScript = async (connection: Connection) => IvyScriptLanguage.startClient(connection, MonacoEditorUtil.getInstance());
    const reconnectScript = async (connection: Connection, oldClient: MonacoLanguageClient) => {
      try {
        await oldClient.stop(0);
      } catch (error) {
        console.warn(error);
      }
      return initScript(connection);
    };
    webSocketConnection<MonacoLanguageClient>(IvyScriptLanguage.webSocketUrl(webSocketAddress)).listen({
      onConnection: initScript,
      onReconnect: reconnectScript,
      logger: console
    });
  }

  private async startInscriptionWebSocketClient(webSocketAddress: string) {
    const initInscription = async (connection: Connection) => {
      this.inscriptionClient = InscriptionClientJsonRpc.startClient(connection);
      return this.inscriptionClient;
    };
    const reconnectInscription = async (connection: Connection, oldClient: InscriptionClientJsonRpc) => {
      try {
        await oldClient.stop();
      } catch (error) {
        console.warn(error);
      }
      return initInscription(connection);
    };
    return webSocketConnection<InscriptionClientJsonRpc>(InscriptionClientJsonRpc.webSocketUrl(webSocketAddress)).listen({
      onConnection: initInscription,
      onReconnect: reconnectInscription,
      logger: console
    });
  }

  handle(action: Action) {
    if (EnableInscriptionAction.is(action)) {
      this.action = action;
      this.initialize();
    }
    if (ToggleInscriptionAction.is(action)) {
      if (!this.inscriptionElement) {
        this.inscriptionElement = this.selectionService.getModelRoot().id;
        this.updateInscriptionUi();
      }
      this.changeUiVisiblitiy(action.force);
    }
    if (Action.is(action) && action.kind === OpenAction.KIND) {
      this.changeUiVisiblitiy(true);
    }
    if (SwitchThemeAction.is(action)) {
      this.updateInscriptionUi();
      MonacoEditorUtil.setTheme(action.theme);
    }
    return;
  }

  private initInscriptionContext() {
    const model = this.selectionService.getModelRoot();
    if (this.action?.inscriptionContext) {
      return this.action.inscriptionContext;
    }
    return {
      app: GArgument.getString(model, 'app') ?? 'designer',
      pmv: GArgument.getString(model, 'pmv') ?? ''
    };
  }

  private changeUiVisiblitiy(force?: boolean) {
    if (force !== undefined) {
      this.setContainerVisible(force);
    } else {
      this.toggleContainerVisible();
    }
    window.dispatchEvent(new CustomEvent('resize'));
  }

  selectionChanged(root: Readonly<GModelRoot>, selectedElements: string[]): void {
    const selected = selectedElements
      .map(id => root.index.getById(id))
      .filter(isNotUndefined)
      .filter(isOpenable)[0];
    if (selected) {
      this.inscriptionElement = selected.id;
    } else {
      this.inscriptionElement = this.inscriptionElement ? root.id : undefined;
      if (!this.isOutlineOpen()) {
        this.changeUiVisiblitiy(false);
      }
    }
    this.updateInscriptionUi();
  }

  private isOutlineOpen() {
    return this.containerElement.querySelector('.ui-outline') !== null;
  }

  selectFromOutline(id: string) {
    const actions = [
      SelectAction.create({ selectedElementsIDs: [id], deselectedElementsIDs: true }),
      MoveIntoViewportAction.create({ elementIds: [id] })
    ];
    const parent = id.substring(0, id.lastIndexOf('-'));
    if (this.selectionService.getModelRoot().id !== parent) {
      this.actionDispatcher.dispatch(JumpAction.create({ elementId: parent, noViewportUpdate: true }));
      this.actionDispatcher.dispatch(SelectAllAction.create(false));
      this.actionDispatcher.dispatchAfterNextUpdate(...actions);
    } else {
      this.actionDispatcher.dispatchAll(actions);
    }
  }
}